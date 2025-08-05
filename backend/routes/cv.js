const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const auth = require('../middleware/auth');
const path = require('path');
const { rankCVWithGroq } = require('../utils/groq');
const { keywordMatch } = require('../utils/keywordMatch');

const router = express.Router();

// Multer setup (memory storage)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.pdf' || ext === '.docx') {
      cb(null, true);
    } else {
      cb(new Error('Only .pdf and .docx files are allowed'));
    }
  },
});

// Upload CVs
router.post('/upload', auth, upload.array('files', 10), async (req, res) => {
  try {
    const results = await Promise.all(req.files.map(async (file) => {
      let text = '';
      if (file.mimetype === 'application/pdf') {
        text = (await pdfParse(file.buffer)).text;
      } else if (
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.originalname.toLowerCase().endsWith('.docx')
      ) {
        const result = await mammoth.extractRawText({ buffer: file.buffer });
        text = result.value;
      }
      return { filename: file.originalname, text };
    }));
    res.json({ cvs: results });
  } catch (err) {
    res.status(400).json({ message: err.message || 'File processing error' });
  }
});

// Rank CVs
router.post('/rank', auth, async (req, res) => {
  const { jobDescription, cvs, requiredKeywords = [], optionalKeywords = [] } = req.body;
  const apiKey = process.env.GROQ_API_KEY;

  if (!jobDescription || !Array.isArray(cvs)) {
    return res.status(400).json({ message: 'Missing jobDescription or cvs' });
  }

  const results = await Promise.all(cvs.map(async (cv) => {
    let score, reason, matchedRequired = [], matchedOptional = [];
    let usedManualMatching = false;

    try {
      const groqRes = await rankCVWithGroq(jobDescription, cv.text, apiKey);
      score = groqRes.score;
      reason = groqRes.reason;
      console.log(`✅ Groq API used for ${cv.filename}`);
    } catch (e) {
      usedManualMatching = true;
      const match = keywordMatch(cv.text, requiredKeywords, optionalKeywords);
      score = match.score;
      reason = `Manual keyword match: ${score}% of required keywords matched. (Groq API failed: ${e.message})`;
      matchedRequired = match.matchedRequired;
      matchedOptional = match.matchedOptional;
      console.log(`⚠️ Manual keyword matching used for ${cv.filename} - ${e.message}`);
    }

    if (!usedManualMatching && requiredKeywords.length > 0) {
      const match = keywordMatch(cv.text, requiredKeywords, optionalKeywords);
      matchedRequired = match.matchedRequired;
      matchedOptional = match.matchedOptional;
    }

    return {
      filename: cv.filename,
      score,
      reason,
      matchedRequired,
      matchedOptional,
      usedManualMatching
    };
  }));

  res.json({ results });
});

module.exports = router;
