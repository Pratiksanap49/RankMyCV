import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Results() {
  const [results, setResults] = useState([]);
  const [jobDescription, setJobDescription] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const res = sessionStorage.getItem('results');
    const jd = sessionStorage.getItem('jobDescription');
    if (!res || !jd) {
      navigate('/upload');
      return;
    }
    setResults(JSON.parse(res));
    setJobDescription(jd);
  }, [navigate]);

  const saveToHistory = async () => {
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/history', {
        jobDescription,
        results
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMessage('Saved to history!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to save history');
    }
  };

  return (
    <div className="results-container">
      <h2>Ranking Results</h2>
      <button onClick={saveToHistory}>Save to History</button>
      {message && <div className="message">{message}</div>}
      <div className="results-list">
        {results.sort((a, b) => b.score - a.score).map((r, i) => (
          <div key={i} className={`result-card ${r.usedManualMatching ? 'manual-match' : 'ai-match'}`}>
            <h3>{r.filename}</h3>
            <p><strong>Score:</strong> {r.score}</p>
            <p><strong>Reason:</strong> {r.reason}</p>
            <p><strong>Matched Required:</strong> {r.matchedRequired?.join(', ') || '-'}</p>
            <p><strong>Matched Optional:</strong> {r.matchedOptional?.join(', ') || '-'}</p>
            {r.usedManualMatching && (
              <div className="manual-match-badge">⚠️ Manual Keyword Matching Used</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 