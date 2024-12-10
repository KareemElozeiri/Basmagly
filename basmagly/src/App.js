import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import logo from './logo.svg';
import './App.css';
import LoginSignup from './Components/LoginSignup/LoginSignup';
import Home from './Components/Home/Home';
import ChatBot from './Pages/ChatBot';
import DocumentManagement from './Pages/Docs';
import Quizzes from './Pages/Quizzes';
import Default from './Pages/Default';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginSignup />} />

        <Route path="/home" element={<Home />}>
          <Route path="/home/default" element={<Default />} />
          <Route path="/home/documents" element={<DocumentManagement />} />
          <Route path="/home/chatbot" element={<ChatBot />} />
          <Route path="/home/quizzes" element={<Quizzes />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
