import React, { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { FaBars, FaHome } from "react-icons/fa";
import { BiFile, BiChat, BiTask } from 'react-icons/bi';
import Cookies from 'js-cookie'; // Import for accessing cookies
import './Home.css';

const Home = ({ Children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [userImage, setUserImage] = useState('/images/default-avatar-profile-icon-of-social-media-user-vector.jpg');
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
        document.title = "Home - Basmagly";

        // Fetch user image from cookies
        // const image = Cookies.get('userImage');
        // if (image) setUserImage(image);
    }, []);

    return (
        <div className="container">
            <div style={{ width: isOpen ? "250px" : "50px" }} className="sidebar">
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
                        activeclassName="active_section"
                    >
                        <div className="icon">{item.icon}</div>
                        <div style={{ display: isOpen ? "block" : "none" }} className="link_text">
                            {item.name}
                        </div>
                    </NavLink>
                ))}
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
                        <a href="#about">About Us</a>
                        <a href="#contact">Contact Us</a>
                    </div>
                    <div className="user-menu" onClick={toggleDropdown}>
                        <div className="user-photo">
                            <img src="https://via.placeholder.com/150" alt="User" />
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
