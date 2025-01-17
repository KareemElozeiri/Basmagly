import React, { useEffect, useState, useRef } from "react";
import { FaPaperPlane, FaTrashAlt, FaFilePdf } from 'react-icons/fa';
import axios from "../APIs/axios";
import Cookies from "js-cookie";
import { PDFDocument, rgb } from 'pdf-lib';
import './ChatBot.css';

const ChatBot = () => {
    useEffect(() => {
        document.title = "Chatbot - Basmagly";
    }, []);

    const BASEURL = "http://127.0.0.1:8000/";
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const getAuthHeaders = () => ({
        headers: { 
            Authorization: `Token ${Cookies.get("authToken")}`
        }
    });

    // Handle sending a message
    const sendMessage = async () => {
      if (message.trim()) {
          const userMessage = { text: message, type: 'user', timestamp: new Date().toISOString() };
          setMessages(prev => [...prev, userMessage]);
          setMessage('');
          setIsLoading(true);

          try {
              const response = await axios.post(
                  `${BASEURL}chat/answer_question/`,
                  { question: message },
                  getAuthHeaders()
              );

              const botMessage = { 
                  text: response.data.answer,
                  context: response.data.supporting_context, // Keep storing context for PDF
                  type: 'bot', 
                  timestamp: new Date().toISOString() 
              };
              setMessages(prev => [...prev, botMessage]);
          } catch (error) {
              console.error('Error:', error);
              const errorMessage = { 
                  text: "Sorry, I'm having trouble connecting right now. Please try again later.", 
                  type: 'error',
                  timestamp: new Date().toISOString()
              };
              setMessages(prev => [...prev, errorMessage]);
          } finally {
              setIsLoading(false);
          }
      }
    };
    // Handle clearing the chat
    const clearChat = () => {
        setMessages([]);
    };

    // Create and download PDF
    const saveChatAsPDF = async () => {
        try {
            const pdfDoc = await PDFDocument.create();
            const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
            const { height } = page.getSize();
            
            let yPosition = height - 50;
            const lineHeight = 20;
            const margin = 50;
            
            // Add title
            page.drawText('Chat History', {
                x: margin,
                y: yPosition,
                size: 16,
                color: rgb(0, 0, 0),
            });
            
            yPosition -= lineHeight * 2;

            // Add messages
            for (const msg of messages) {
                if (yPosition < margin) {
                    const newPage = pdfDoc.addPage([595.28, 841.89]);
                    yPosition = height - 50;
                }

                const timestamp = new Date(msg.timestamp).toLocaleString();
                const prefix = msg.type === 'user' ? 'You: ' : 'Bot: ';
                
                // Draw timestamp
                page.drawText(timestamp, {
                    x: margin,
                    y: yPosition,
                    size: 8,
                    color: rgb(0.5, 0.5, 0.5),
                });
                
                yPosition -= lineHeight;

                // Draw message
                const text = `${prefix}${msg.text}`;
                const words = text.split(' ');
                let line = '';
                
                for (const word of words) {
                    if ((line + word).length * 6 > page.getSize().width - margin * 2) {
                        page.drawText(line, {
                            x: margin,
                            y: yPosition,
                            size: 10,
                            color: rgb(0, 0, 0),
                        });
                        yPosition -= lineHeight;
                        line = word + ' ';
                    } else {
                        line += word + ' ';
                    }
                }
                
                if (line) {
                    page.drawText(line, {
                        x: margin,
                        y: yPosition,
                        size: 10,
                        color: rgb(0, 0, 0),
                    });
                }
                
                yPosition -= lineHeight;

                // Add supporting context if available
                if (msg.context) {
                    yPosition -= lineHeight;
                    page.drawText('Supporting Context:', {
                        x: margin,
                        y: yPosition,
                        size: 8,
                        color: rgb(0.4, 0.4, 0.4),
                    });
                    
                    yPosition -= lineHeight;
                    const contextWords = msg.context.split(' ');
                    line = '';
                    
                    for (const word of contextWords) {
                        if ((line + word).length * 6 > page.getSize().width - margin * 2) {
                            page.drawText(line, {
                                x: margin,
                                y: yPosition,
                                size: 8,
                                color: rgb(0.4, 0.4, 0.4),
                            });
                            yPosition -= lineHeight;
                            line = word + ' ';
                        } else {
                            line += word + ' ';
                        }
                    }
                    
                    if (line) {
                        page.drawText(line, {
                            x: margin,
                            y: yPosition,
                            size: 8,
                            color: rgb(0.4, 0.4, 0.4),
                        });
                    }
                }
                
                yPosition -= lineHeight * 1.5;
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `chat-history-${new Date().toISOString()}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        }
    };

    // Handle key press for sending message
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="chatbot-container">
            {/* Chat Display Area */}
            <div className="chat-display">
                <div className="header">
                    
                </div>
                <div className="messages">
                    {messages.map((msg, index) => (
                        <div key={index} className={`message ${msg.type}`}>
                            <div className="message-content">{msg.text}</div>
                            <div className="message-timestamp">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="message bot">
                            <div className="loading-indicator">...</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Input Area */}
            <div className="chat-input-area">
                <button className="clear-chat" onClick={clearChat} title="Clear chat">
                    <FaTrashAlt />
                </button>
                <button className="save-chat" onClick={saveChatAsPDF} title="Save as PDF">
                    <FaFilePdf />
                </button>

                <input
                    type="text"
                    placeholder="Your Message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                />
                <button 
                    className="send-button" 
                    onClick={sendMessage}
                    disabled={isLoading || !message.trim()}
                >
                    <FaPaperPlane />
                </button>
                
            </div>
        </div>
    );
}

export default ChatBot;