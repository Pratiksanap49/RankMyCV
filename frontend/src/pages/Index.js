import React from 'react';
import { Link } from 'react-router-dom';

export default function Index() {
  const token = localStorage.getItem('token');

  return (
    <div className="index-container">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="gradient-text">RankMyCV</span>
          </h1>
          <p className="hero-subtitle">
            AI-Powered Resume Analysis and Job Matching Platform
          </p>
          <p className="hero-description">
            Upload your resume and get instant insights, skill analysis, and personalized job recommendations 
            powered by advanced AI technology.
          </p>
          
          <div className="hero-buttons">
            {token ? (
              <Link to="/upload" className="cta-button primary">
                Get Started
              </Link>
            ) : (
              <>
                <Link to="/login" className="cta-button primary">
                  Login
                </Link>
                <Link to="/signup" className="cta-button secondary">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
        
        <div className="hero-visual">
          <div className="floating-card">
            <div className="card-icon">📄</div>
            <h3>Resume Upload</h3>
            <p>Upload your resume in PDF or DOC format</p>
          </div>
          <div className="floating-card">
            <div className="card-icon">🤖</div>
            <h3>AI Analysis</h3>
            <p>Advanced AI analyzes your skills and experience</p>
          </div>
          <div className="floating-card">
            <div className="card-icon">🎯</div>
            <h3>Smart Matching</h3>
            <p>Get personalized job recommendations</p>
          </div>
        </div>
      </div>

      <div className="features-section">
        <h2 className="section-title">Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Resume Analysis</h3>
            <p>Advanced AI extracts and analyzes your skills, experience, and qualifications from your resume.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Skill Assessment</h3>
            <p>Get detailed insights into your technical and soft skills with comprehensive scoring.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Job Matching</h3>
            <p>Receive personalized job recommendations based on your profile and preferences.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Performance Tracking</h3>
            <p>Track your application history and see how your profile improves over time.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🔄</div>
            <h3>Real-time Updates</h3>
            <p>Get instant feedback and updates on your resume analysis and job matches.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure & Private</h3>
            <p>Your data is encrypted and protected with enterprise-grade security measures.</p>
          </div>
        </div>
      </div>

      <div className="how-it-works-section">
        <h2 className="section-title">How It Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Upload Resume</h3>
            <p>Upload your resume in PDF or DOC format through our secure platform.</p>
          </div>
          
          <div className="step">
            <div className="step-number">2</div>
            <h3>AI Analysis</h3>
            <p>Our AI analyzes your resume, extracting skills, experience, and qualifications.</p>
          </div>
          
          <div className="step">
            <div className="step-number">3</div>
            <h3>Get Results</h3>
            <p>Receive detailed insights, skill scores, and personalized job recommendations.</p>
          </div>
          
          <div className="step">
            <div className="step-number">4</div>
            <h3>Track Progress</h3>
            <p>Monitor your application history and profile improvements over time.</p>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <h2>Ready to Transform Your Career?</h2>
        <p>Join thousands of professionals who have improved their job prospects with RankMyCV</p>
        {token ? (
          <Link to="/upload" className="cta-button primary large">
            Start Analysis
          </Link>
        ) : (
          <Link to="/signup" className="cta-button primary large">
            Get Started Free
          </Link>
        )}
      </div>
    </div>
  );
} 