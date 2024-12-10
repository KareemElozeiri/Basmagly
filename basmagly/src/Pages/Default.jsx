import React, {useEffect, useState} from "react";
import { BiFile, BiChat, BiTask } from 'react-icons/bi';
import './Default.css'

const Default = () => {

  useEffect(() => {
      document.title = "Home - Basmagly"; // Set the title
  }, []); // Runs once when the component mounts

  return(
    <div className="sections">
        <div className="card">
            <div className="icon"><BiFile /></div>
            <h3>Document Management</h3>
            <p>Store, organize, and access all your important documents in one place.</p>
        </div>
        <div className="card">
            <div className="icon"><BiChat /></div>
            <h3>Chatbot</h3>
            <p>Get instant answers and support with our AI-powered chatbot, available 24/7.</p>
        </div>
        <div className="card">
            <div className="icon"><BiTask /></div>
            <h3>Customizable Quizzes</h3>
            <p>Create and take quizzes tailored to your study needs, track your progress easily.</p>
        </div>
    </div>
  );
 
};

export default Default;
