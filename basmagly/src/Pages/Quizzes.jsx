import React, { useState, useEffect } from 'react';
import axios from "../APIs/axios";
import Cookies from "js-cookie";
import './Quizzes.css';

const Quizzes = () => {
  const BASEURL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/";

  
  const [timer, setTimer] = useState(1);
  const [numQuestions, setNumQuestions] = useState(5);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    document.title = "Quiz - Basmagly";
  }, []);

  // Timer effect
  useEffect(() => {
    let interval;
    if (quizStarted && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            submitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quizStarted, timeRemaining]);

  const getAuthHeaders = () => {
    const authToken = Cookies.get("authToken");
    return {
      headers: { Authorization: `Token ${authToken}` },
    };
  };

  const startQuiz = async () => {
    if (timer <= 0 || numQuestions <= 0) {
      setError('Please select a document, set a valid timer, and enter a valid number of questions.');
      return;
    }

    setLoading(true);
    setError(null);
    try {

      console.log("N_q",numQuestions);
      // generate the quiz
      const response = await axios.post(
        `${BASEURL}chat/generate_quiz/`,
        { numQuestions },
        getAuthHeaders()
      );

      // Log the response to see its structure
      console.log('Quiz API response:', response.data);
      // Parse the API response
      const quizQuestions = response.data.quiz.questions.map((q) => ({
          question: q.question,
          options: Array.isArray(q.options) ? q.options : [],
          correctAnswer: q.correct_answer
      }));

      setQuizQuestions(quizQuestions);
      setTimeRemaining(timer * 60); // Convert minutes to seconds
      setQuizStarted(true);
      setResults(null);
      setAnswers({});
    } catch (error) {
      setError('Failed to start quiz. Please try again.');
      console.error('Error starting quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: answer,
    }));
  };

  const submitQuiz = () => {
    if (!Array.isArray(quizQuestions) || quizQuestions.length === 0) {
      setError('No quiz questions available.');
      return;
    }

    const score = quizQuestions.reduce((acc, q, index) => {
      const userAnswer = answers[index] || 'No Answer';
      return acc + (userAnswer === q.correctAnswer ? 1 : 0);
    }, 0);

    const userResults = quizQuestions.map((q, index) => ({
      question: q.question,
      userAnswer: answers[index] || 'No Answer',
      correctAnswer: q.correctAnswer,
      isCorrect: answers[index] === q.correctAnswer,
    }));

    setResults({ score, total: quizQuestions.length, userResults });
    setQuizStarted(false);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="quiz-page">
      <h1>Quiz Page</h1>

      {error && <div className="error-message">{error}</div>}

      {!quizStarted && !results && (
        <div className="quiz-setup">
          <div className="quiz-settings">
            <div className="setting-group">
              <label htmlFor="timer">Timer (Minutes)</label>
              <input
                id="timer"
                type="number"
                value={timer}
                onChange={(e) => setTimer(Math.max(1, Number(e.target.value)))}
                min="1"
                className="number-input"
              />
            </div>

            <div className="setting-group">
              <label htmlFor="questions">Number of Questions</label>
              <input
                id="questions"
                type="number"
                value={numQuestions}
                onChange={(e) => setNumQuestions(Math.max(1, Number(e.target.value)))}
                min="1"
                className="number-input"
              />
            </div>
          </div>

          <button onClick={startQuiz} className="start-button">
            Start Quiz
          </button>
        </div>
      )}

      {quizStarted && Array.isArray(quizQuestions) && quizQuestions.length > 0 && (
        <div className="quiz-questions">
          <div className="timer">Time Remaining: {formatTime(timeRemaining)}</div>

          {quizQuestions.map((question, index) => (
            <div key={index} className="question-card">
              <h3>{question.question}</h3>
              <div className="options">
                {Array.isArray(question.options) &&
                  question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="option">
                      <input
                        type="radio"
                        id={`question-${index}-option-${optionIndex}`}
                        name={`question-${index}`}
                        value={option}
                        checked={answers[index] === option}
                        onChange={() => handleAnswerChange(index, option)}
                      />
                      <label htmlFor={`question-${index}-option-${optionIndex}`}>{option}</label>
                    </div>
                  ))}
              </div>
            </div>
          ))}

          <button onClick={submitQuiz} className="submit-button">
            Submit Quiz
          </button>
        </div>
      )}

      {results && (
        <div className="quiz-results">
          <h2>Quiz Results</h2>
          <div className="score">
            Score: {results.score}/{results.total}
          </div>
          <div className="detailed-results">
            {results.userResults.map((result, index) => (
              <div
                key={index}
                className={`result-item ${result.isCorrect ? 'correct' : 'incorrect'}`}
              >
                <div className="question">Question: {result.question}</div>
                <div className="answer">Your Answer: {result.userAnswer}</div>
                <div className="correct-answer">Correct Answer: {result.correctAnswer}</div>
              </div>
            ))}
          </div>
          <button onClick={() => setResults(null)} className="new-quiz-button">
            Start New Quiz
          </button>
        </div>
      )}
    </div>
  );
};

export default Quizzes;
