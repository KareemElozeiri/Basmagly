import React, { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { FaBars, FaHome } from "react-icons/fa";
import { BiFile, BiChat, BiTask } from 'react-icons/bi';
import './Home.css';
import Theme from "../Theme/Theme";

const Home = ({ Children }) => {

    const [isDark, setIsDark] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const toggle = () => setIsOpen(!isOpen);
    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

    const menuItem = [
        { path: "default", name: "Home", icon: <FaHome /> },
        { path: "documents", name: "Documents", icon: <BiFile /> },
        { path: "chatbot", name: "Chatbot", icon: <BiChat /> },
        { path: "quizzes", name: "Quizzes", icon: <BiTask /> },
    ];

    useEffect(() => {
        // Get saved theme preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setIsDark(savedTheme === 'dark');
            document.body.classList.toggle('dark-mode', savedTheme === 'dark');
        }
        
        document.title = "Home - Basmagly";
    }, []);

    const handleThemeToggle = () => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        localStorage.setItem('theme', newTheme ? 'dark' : 'light');
        document.body.classList.toggle('dark-mode', newTheme);
    };

    return (
        <div className={`container ${isDark ? 'dark-mode' : ''}`}>
            <div data-testid="sidebar" style={{ width: isOpen ? "250px" : "50px" }} className="sidebar">
                <div className="top_section">
                    <h1 style={{ display: isOpen ? "block" : "none" }} className="logo">Basmagly</h1>
                    <div style={{ marginLeft: isOpen ? "40px" : "0px" }} className="bars">
                        <FaBars onClick={toggle} />
                    </div>
                </div>

                {menuItem.map((item, index) => (
                    <NavLink
                        to={item.path}
                        key={index}
                        className="link"
                        activeclassname="active_section"
                    >
                        <div className="icon">{item.icon}</div>
                        <div style={{ display: isOpen ? "block" : "none" }} className="link_text">
                            {item.name}
                        </div>
                    </NavLink>
                ))}

                <Theme isDark={isDark} onToggle={handleThemeToggle} />
                
            </div>
            <main
                className="main-content"
                style={{
                    marginLeft: isOpen ? "250px" : "50px",
                    width: `calc(100% - ${isOpen ? "250px" : "50px"})`
                }}
            >
                {Children}
                <div className="navbar">
                    <div className="links">
                        <NavLink to="/about">About Us</NavLink>
                        <NavLink to="/feedback">Feedback</NavLink>
                    </div>
                    <div className="user-menu" onClick={toggleDropdown}>
                        <div className="user-photo">
                        <img src="https://picsum.photos/id/397/150/150.jpg" alt="User" />

                            {/* <img src="https://via.placeholder.com/150" alt="User" /> */}
                        </div>
                        <div className={`dropdown ${isDropdownOpen ? "show" : ""}`}>
                            <a href="/profile">Profile</a>
                            <a href="/">Log Out</a>
                        </div>
                    </div>
                </div>
                
                <Outlet />
            </main>
        </div>
    );
};

export default Home;
