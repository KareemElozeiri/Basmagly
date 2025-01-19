// FeedbackPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './FeedbackPage.css';

const FeedbackPage = () => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowPopup(true);
    // Reset form
    setRating(0);
    setFeedback('');
    // Hide popup and redirect after 3 seconds
    setTimeout(() => {
      setShowPopup(false);
      navigate('/home/default');
    }, 3000);
  };

  return (
    <div className="feedback-container">
      {/* Navbar Section */}
      <nav className="navbar">
        <button className="nav-button" onClick={() => navigate('/home/default')}>
          Home
        </button>
        <button className="nav-button" onClick={() => navigate('/')}>
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

      {/* Thank you popup */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Thank You!</h3>
            <p>We appreciate your valuable feedback.</p>
            <div className="popup-icon">✨</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackPage;