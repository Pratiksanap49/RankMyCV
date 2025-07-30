const axios = require('axios');

async function rankCVWithGroq(jobDescription, cvText, apiKey) {
  if (!apiKey || apiKey === 'your_real_key_here') {
    throw new Error('GROQ_API_KEY not configured - using manual keyword matching');
  }

  const prompt = `You are an expert recruiter AI.\n\nHere is a job description:\n${jobDescription}\n\nAnd here is a candidate's resume:\n${cvText}\n\nReturn a JSON like this:\n{\n  \"score\": 78,\n  \"reason\": \"Good React experience but lacks backend skills\"\n}`;

  const body = {
    model: 'llama3-70b-8192',
    messages: [
      { role: 'system', content: 'You are an expert recruiter AI.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 256,
    temperature: 0.2
  };

  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  };

  try {
    console.log('Making request to Groq API with model:', body.model);
    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', body, { headers });
    const content = response.data.choices[0].message.content;
    // Try to parse JSON from the response
    try {
      const json = JSON.parse(content.match(/\{[\s\S]*\}/)[0]);
      return json;
    } catch (e) {
      throw new Error('Groq API did not return valid JSON');
    }
  } catch (error) {
    console.error('Groq API Error Details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    throw new Error(`Groq API failed: ${error.message}`);
  }
}

module.exports = { rankCVWithGroq }; 