import React, { useState } from 'react';
import "./FeedbackPage.css"

const FeedbackPage = () => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the feedback to your backend
    // For now, we'll just console log and use mailto
    console.log({ rating, feedback });
    window.location.href = `mailto:basmagly@gmail.com?subject=Feedback&body=Rating: ${rating}%0D%0AFeedback: ${feedback}`;
  };

  return (
    <div className="feedback-container">
        {/* Navbar Section */}
        <nav className="navbar">
            <button className="nav-button" onClick={() => (window.location.href = "/home/default")}>
            Home
            </button>
            <button className="nav-button" onClick={() => (window.location.href = "/")}>
            Logout
            </button>
        </nav>
      <h2>We Value Your Feedback</h2>
      <form onSubmit={handleSubmit} className="feedback-form">
        <div className="rating-container">
          <p>Rate your experience:</p>
          <div className="rating-buttons">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                className={`rating-button ${rating === value ? 'selected' : ''}`}
                onClick={() => setRating(value)}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
        <div className="feedback-input">
          <label htmlFor="feedback">Your Feedback:</label>
          <textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="submit-button">
          Submit Feedback
        </button>
      </form>
        <p className="contact-email">
            Contact email: basmagly@gmail.com
        </p>
    </div>
    
  );
};

export default FeedbackPage;