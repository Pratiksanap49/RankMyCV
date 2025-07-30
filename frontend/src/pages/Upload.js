import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Upload() {
  const [files, setFiles] = useState([]);
  const [jobDescription, setJobDescription] = useState('');
  const [requiredKeywords, setRequiredKeywords] = useState('');
  const [optionalKeywords, setOptionalKeywords] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!files.length || !jobDescription) {
      setError('Please upload at least one CV and enter a job description.');
      setLoading(false);
      return;
    }
    
    try {
      // Upload files
      const formData = new FormData();
      files.forEach(f => formData.append('files', f));
      const token = localStorage.getItem('token');
      
      console.log('Uploading files...');
      const uploadRes = await axios.post('/api/cv/upload', formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Ranking CVs...');
      // Rank CVs
      const cvs = uploadRes.data.cvs;
      const rankRes = await axios.post('/api/cv/rank', {
        jobDescription,
        cvs,
        requiredKeywords: requiredKeywords.split(',').map(k => k.trim()).filter(Boolean),
        optionalKeywords: optionalKeywords.split(',').map(k => k.trim()).filter(Boolean)
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Save results to sessionStorage and redirect
      sessionStorage.setItem('results', JSON.stringify(rankRes.data.results));
      sessionStorage.setItem('jobDescription', jobDescription);
      navigate('/results');
    } catch (err) {
      console.error('Upload/Ranking error:', err);
      setError(err.response?.data?.message || 'Upload or ranking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload CVs & Rank</h2>
      <p style={{ textAlign: 'center', marginBottom: '2rem', color: '#666' }}>
        Upload multiple CV files (.pdf or .docx) and get AI-powered rankings based on your job description.
      </p>
      <form onSubmit={handleSubmit}>
        <input type="file" multiple accept=".pdf,.docx" onChange={handleFileChange} />
        <textarea placeholder="Job Description" value={jobDescription} onChange={e => setJobDescription(e.target.value)} required />
        <input type="text" placeholder="Required Keywords (comma separated)" value={requiredKeywords} onChange={e => setRequiredKeywords(e.target.value)} />
        <input type="text" placeholder="Optional Keywords (comma separated)" value={optionalKeywords} onChange={e => setOptionalKeywords(e.target.value)} />
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Rank CVs'}
        </button>
      </form>
      {error && <div className="error">{error}</div>}
      {loading && <div className="message">Processing your CVs... This may take a moment.</div>}
    </div>
  );
} 