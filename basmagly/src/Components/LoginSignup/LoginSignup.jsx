import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {FaUser, FaLock} from "react-icons/fa"
import { MdDriveFileRenameOutline, MdOutlineMail } from "react-icons/md";
import './LoginSignup.css'
import axios from "../../APIs/axios"
import Cookies from 'js-cookie';


const USER_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;


const LoginSignup = () => {

    const navigate = useNavigate();
    const [errMsg, setErrMsg] = useState('');

    //////////////////////////////////////////////////////////////
    /////////////////////////    Login   /////////////////////////
    //////////////////////////////////////////////////////////////

    const [user, setUser] = useState('');
    const [pwd, setPwd] = useState('');
    
    const BASEURL = 'http://127.0.0.1:8000/';

    const handleLogin = async (e) => {
        e.preventDefault();
    
        try {
            const response = await axios.post(
                BASEURL +'login/',
                { username: user, password: pwd },
                { headers: { 'Content-Type': 'application/json' } }
            );
    
            if (response.status === 200) {
                // Save token in cookies                
                Cookies.set('authToken', response.data.token, { expires: 7 }); // Token valid for 7 days
                setErrMsg(''); 
                
                navigate("/home/default"); 
            } else {
                setErrMsg("Login failed. Invalid username or password.");
            }
        } catch (error) {
            if (error.response) {
                setErrMsg(error.response.data.message || "Login failed");
            } else {
                setErrMsg("An error occurred. Please try again.");
            }
        }
    };

    //////////////////////////////////////////////////////////////
    /////////////////////////    Signup   ////////////////////////
    //////////////////////////////////////////////////////////////


    const userRef = useRef();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    
    const [validUser, setvalidUser] = useState(false);
    const [userFocus, setUserFocus] = useState(false);

    const [validPwd, setValidPwd] = useState(false);
    const [pwdFocus, setPwdFocus] = useState(false);

    const [matchPwd, setMatchPwd] = useState('');
    const [validMatch, setValidMatch] = useState(false);
    const [matchFocus, setMatchFocus] = useState(false);

    const [action,setAction] = useState('');
    
    const [success, setSuccess] = useState(false);


    useEffect(() => {
        setvalidUser(USER_REGEX.test(user));
    }, [user])

    useEffect(() => {
        setValidPwd(PWD_REGEX.test(pwd));
        setValidMatch(pwd === matchPwd);
    }, [pwd, matchPwd])

    useEffect(() => {
        setErrMsg('');
    }, [user, pwd, matchPwd])

    
    const handleSignup = async (e) => {
        e.preventDefault();
        
        const v1 = USER_REGEX.test(user);
        const v2 = PWD_REGEX.test(pwd);
        if (!v1 || !v2) {
            setErrMsg("Invalid Entry");
            return;
        }

        try {
            const response = await axios.post(
                BASEURL+'signup/', 
                { name, email, username: user, password: pwd },
                { headers: { 'Content-Type': 'application/json' } }
            );
    
            if (response.status === 201) {
                setSuccess(true);
                setErrMsg(''); // Clear error message
                navigate("/home/default"); // Redirect to home on success
            } else {
                setErrMsg("Signup failed. Please try again.");
            }
        } catch (error) {
            if (error.response) {
                setErrMsg(error.response.data.message || "Signup failed");
            } else {
                setErrMsg("An error occurred. Please try again.");
            }
        }
    }


    // Move between Login and Sign-up

    const signupLink = () => {
        document.title = "Basmagly - Sign up";
        setAction(' active');
        setUser('');
        setPwd('');
    };

    const loginLink = () => {
        document.title = "Basmagly - Login";
        setAction('');
        setUser('');
        setPwd('');
        setEmail('');
        setName('');
        setMatchPwd('');
    };


    return (
        <div className={`wrapper${action}`}>
            {/* Login section */}
            <div className="form-box login">
                <form onSubmit={handleLogin}>
                    <h1>Login</h1>
                    <div className="input-box">
                        <input type="text" 
                        value = {user}
                        placeholder='Username' 
                        onChange={(e) => setUser(e.target.value)}
                        required />
                        <FaUser className='icon'/>
                    </div>
                    <div className="input-box">
                        <input type="password" 
                        value = {pwd}
                        placeholder='Password'
                        onChange={(e) => setPwd(e.target.value)}
                        required />
                        <FaLock className='icon'/>
                    </div>
                    <button type="submit">Login</button>
                    <div className="signup-link">
                        <p>Don't have an account?  <a href="#" onClick={signupLink}>Sign up</a></p>
                    </div>
                </form>
            </div>
            {/* Sign up section */}
            <div className="form-box signup">
                <form onSubmit={handleSignup}>
                    <h1>Register Now</h1>
                    
                    <div className="input-box">
                        <input type="text" 
                        placeholder='Name' 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required />
                        <MdDriveFileRenameOutline className='icon'/>
                    </div>
                    <div className="input-box">
                        <input type="email" 
                        placeholder='Email' 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required />
                        <MdOutlineMail className='icon'/>
                    </div>
                    <div className="input-box">
                        <input
                            type="text"
                            id="username"
                            ref={userRef}
                            placeholder='username'
                            autoComplete="off"
                            onChange={(e) => setUser(e.target.value)}
                            value={user}
                            required                       
                            aria-invalid={validUser ? "false" : "true"}
                            aria-describedby="uidnote"
                            onFocus={() => setUserFocus(true)}
                            onBlur={() => setUserFocus(false)}
                        />
                        <FaUser className='icon'/>
                    </div>
                    <p id="uidnote" className={userFocus && user && !validUser ? "instructions" : "offscreen"}>
                        <FontAwesomeIcon icon={faInfoCircle} />
                        4 to 24 characters.<br />
                        Must begin with a letter.<br />
                        Only letters, numbers & underscores are allowed.
                    </p>
                    
                    <div className="input-box">
                        <input
                            type="password"
                            onChange={(e) => setPwd(e.target.value)}
                            value={pwd}
                            placeholder='password'
                            required
                            aria-invalid={validPwd ? "false" : "true"}
                            aria-describedby="pwdnote"
                            onFocus={() => setPwdFocus(true)}
                            onBlur={() => setPwdFocus(false)}
                        />
                        <FaLock className='icon'/>
                    </div>
                    <p id="pwdnote" className={pwdFocus && !validPwd ? "instructions" : "offscreen"}>
                        <FontAwesomeIcon icon={faInfoCircle} />
                        8 to 24 characters.<br />
                        Must include uppercase and lowercase letters, a number and a special character.<br />
                        Allowed special characters: <span aria-label="exclamation mark">!</span> <span aria-label="at symbol">@</span> <span aria-label="hashtag">#</span> <span aria-label="dollar sign">$</span> <span aria-label="percent">%</span>
                    </p>
                    <div className="input-box">
                        <input
                            type="password"
                            id="confirm_pwd"
                            placeholder='confirm password'
                            onChange={(e) => setMatchPwd(e.target.value)}
                            value={matchPwd}
                            required
                            aria-invalid={validMatch ? "false" : "true"}
                            aria-describedby="confirmnote"
                            onFocus={() => setMatchFocus(true)}
                            onBlur={() => setMatchFocus(false)}
                        />
                        <p id="confirmnote" className={matchFocus && !validMatch ? "instructions" : "offscreen"}>
                            <FontAwesomeIcon icon={faInfoCircle} />
                            Must match the first password input field.
                        </p>
                        <FaLock className='icon'/>
                    </div>
                    <button disabled={!validUser || !validPwd || !validMatch ? true : false}>Sign Up</button>
                    <div className="signup-link">
                        <p>Already have an account?  <a href="#" onClick={loginLink}>Login</a></p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginSignup;