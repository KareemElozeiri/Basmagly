import React, {useEffect, useState, useRef} from "react";
import { FaPaperPlane, FaTrashAlt, FaFileAlt } from 'react-icons/fa';
import './ChatBot.css'

const ChatBot = () => {

    useEffect(() => {
        document.title = "Chatbot - Basmagly"; 
    }, []);

    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [selectedDocument, setSelectedDocument] = useState('');
    const [isDocumentSelectionOpen, setIsDocumentSelectionOpen] = useState(false);

    // Reference for document selection dropdown
    const documentSelectionRef = useRef(null);

    // List of documents
    const documents = [
      { name: 'Document A', id: 1 },
      { name: 'Document B', id: 2 },
      { name: 'Document C', id: 3 },
    ];

    // Handle sending a message
    const sendMessage = () => {
      if (message.trim()) {
        setMessages([...messages, { text: message, type: 'user' }]);
        setMessage('');
      }
    };

    // Handle clearing the chat
    const clearChat = () => {
      setMessages([]);
    };

    // Handle document selection
    const selectDocument = (doc) => {
      setSelectedDocument(doc);
      setIsDocumentSelectionOpen(false); // Close the selection after choosing
    };

    // Close document selection if clicked outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (documentSelectionRef.current && !documentSelectionRef.current.contains(event.target)) {
          setIsDocumentSelectionOpen(false);
        }
      };

      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }, []);

    return (
      <div className="chatbot-container">
        {/* Chat Display Area */}
        <div className="chat-display">
          <div className="header">
            <button className="clear-chat" onClick={clearChat}>
              <FaTrashAlt />
            </button>
          </div>
          <div className="messages">
            {messages.map((msg, index) => (
              <div key={index} className={msg.type}>
                {msg.text}
              </div>
            ))}
          </div>
        </div>

        {/* Chat Input Area */}
        <div className="chat-input-area">
          <div className="document-selection" ref={documentSelectionRef}>
            <button className="select-document" onClick={() => setIsDocumentSelectionOpen(!isDocumentSelectionOpen)}>
              <FaFileAlt />
            </button>
            {isDocumentSelectionOpen && (
              <div className="document-list">
                {documents.map((doc) => (
                  <div key={doc.id} className="document-item" onClick={() => selectDocument(doc.name)}>
                    {doc.name}
                  </div>
                ))}
              </div>
            )}
            {selectedDocument && <span className="selected-document">Selected: {selectedDocument}</span>}
          </div>

          <input
            type="text"
            placeholder="Your Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button className="send-button" onClick={sendMessage}>
            <FaPaperPlane />
          </button>
        </div>
      </div>
    );
}

export default ChatBot;