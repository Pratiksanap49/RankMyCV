import React from 'react';

export default function Test() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Test Page</h1>
      <p>If you can see this, routing is working!</p>
      <p>Current path: {window.location.pathname}</p>
      <p>Token exists: {localStorage.getItem('token') ? 'Yes' : 'No'}</p>
    </div>
  );
} 