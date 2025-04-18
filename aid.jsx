import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/predict', { text });
      setResult(response.data.prediction);
    } catch (error) {
      setResult('Error detecting news');
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <div className="card">
        <h1 className="title">📰 Fake News Detector</h1>
        <form onSubmit={handleSubmit}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="textarea"
            placeholder="Enter news text here..."
          ></textarea>
          <button type="submit" className="button" disabled={loading}>
            {loading ? 'Checking...' : 'Check News'}
          </button>
        </form>
        {result && (
          <div className="result">
            Result: <span className="highlight">{result}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
