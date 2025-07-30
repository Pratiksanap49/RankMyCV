import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    axios.get('/api/history', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        setHistory(res.data.history);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to fetch history');
        setLoading(false);
      });
  }, [navigate]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="history-container">
      <h2>Submission History</h2>
      {history.length === 0 ? <p>No history found.</p> : (
        history.map((h, i) => (
          <div key={i} className="history-card">
            <p><strong>Date:</strong> {new Date(h.createdAt).toLocaleString()}</p>
            <p><strong>Job Description:</strong> {h.jobDescription}</p>
            <div className="results-list">
              {h.results.sort((a, b) => b.score - a.score).map((r, j) => (
                <div key={j} className="result-card">
                  <h4>{r.filename}</h4>
                  <p><strong>Score:</strong> {r.score}</p>
                  <p><strong>Reason:</strong> {r.reason}</p>
                  <p><strong>Matched Required:</strong> {r.matchedRequired?.join(', ') || '-'}</p>
                  <p><strong>Matched Optional:</strong> {r.matchedOptional?.join(', ') || '-'}</p>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
