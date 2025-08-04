import React, { useState, useEffect } from 'react';
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
    <div className="upload-container modern-upload">
      <div className="upload-header">
        <h2>Upload & Rank CVs</h2>
        <p>Upload multiple CV files and get AI-powered rankings based on your job description</p>
      </div>
      
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label htmlFor="files">Upload CV Files</label>
          <div className="file-upload-area">
            <input 
              type="file" 
              id="files"
              multiple 
              accept=".pdf,.docx" 
              onChange={handleFileChange}
              className="file-input"
            />
            <div className="file-upload-text">
              <div className="upload-icon">📄</div>
              <p>Click to select files or drag and drop</p>
              <p className="file-types">Supports .pdf and .docx files</p>
            </div>
          </div>
          {files.length > 0 && (
            <div className="selected-files">
              <p>Selected files ({files.length}):</p>
              <ul>
                {files.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="jobDescription">Job Description</label>
          <textarea 
            id="jobDescription"
            placeholder="Enter the job description to match against..." 
            value={jobDescription} 
            onChange={e => setJobDescription(e.target.value)} 
            required 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="requiredKeywords">Required Keywords (Optional)</label>
          <input 
            type="text" 
            id="requiredKeywords"
            placeholder="e.g., JavaScript, React, Node.js" 
            value={requiredKeywords} 
            onChange={e => setRequiredKeywords(e.target.value)} 
          />
          <small>Comma-separated keywords that must be present</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="optionalKeywords">Optional Keywords (Optional)</label>
          <input 
            type="text" 
            id="optionalKeywords"
            placeholder="e.g., TypeScript, Docker, AWS" 
            value={optionalKeywords} 
            onChange={e => setOptionalKeywords(e.target.value)} 
          />
          <small>Comma-separated keywords that are nice to have</small>
        </div>
        
        <button type="submit" className="upload-button" disabled={loading}>
          {loading ? 'Processing CVs...' : 'Rank CVs'}
        </button>
      </form>
      
      {error && <div className="error-message">{error}</div>}
      {loading && (
        <div className="loading-message">
          <div className="loading-spinner"></div>
          <p>Processing your CVs... This may take a moment.</p>
        </div>
      )}
    </div>
  );
} 