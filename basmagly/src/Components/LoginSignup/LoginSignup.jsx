import React, { useState, useRef, useEffect } from 'react'
import './LoginSignup.css'
import { faCheck, faTimes, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {FaUser, FaLock} from "react-icons/fa"
import { MdDriveFileRenameOutline, MdOutlineMail } from "react-icons/md";
import axios from "../../APIs/axios"


const USER_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
const REGISTER_URL = '/LoginSignup';


const LoginSignup = () => {

    const userRef = useRef();
    const errRef = useRef();

    const [user, setUser] = useState('');
    const [validName, setValidName] = useState(false);
    const [userFocus, setUserFocus] = useState(false);

    const [pwd, setPwd] = useState('');
    const [validPwd, setValidPwd] = useState(false);
    const [pwdFocus, setPwdFocus] = useState(false);

    const [matchPwd, setMatchPwd] = useState('');
    const [validMatch, setValidMatch] = useState(false);
    const [matchFocus, setMatchFocus] = useState(false);

    const [errMsg, setErrMsg] = useState('');
    const [success, setSuccess] = useState(false);

    const [textColor, setTextColor] = useState('white');

    useEffect(() => {
        setValidName(USER_REGEX.test(user));
    }, [user])

    useEffect(() => {
        setValidPwd(PWD_REGEX.test(pwd));
        setValidMatch(pwd === matchPwd);
    }, [pwd, matchPwd])

    useEffect(() => {
        setErrMsg('');
    }, [user, pwd, matchPwd])

    useEffect(() => {
        if(USER_REGEX.test(user))
            setTextColor('white');
        else
            setTextColor('#8b0000x');
        console.log('user',USER_REGEX.test(textColor));
        console.log('color',textColor);
    }, [user])

    const [action,setAction] = useState('');

    const signupLink = () => {
        setAction(' active');
    };

    const loginLink = () => {
        setAction('');
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        // if button enabled with JS hack
        const v1 = USER_REGEX.test(user);
        const v2 = PWD_REGEX.test(pwd);
        if (!v1 || !v2) {
            setErrMsg("Invalid Entry");
            return;
        }
        try {
            const response = await axios.post(REGISTER_URL,
                JSON.stringify({ user, pwd }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            );
            console.log(response?.data);
            console.log(response?.accessToken);
            console.log(JSON.stringify(response))
            setSuccess(true);
            //clear state and controlled inputs
            //need value attrib on inputs for this
            setUser('');
            setPwd('');
            setMatchPwd('');
        } catch (err) {
            if (!err?.response) {
                setErrMsg('No Server Response');
            } else if (err.response?.status === 409) {
                setErrMsg('Username Taken');
            } else {
                setErrMsg('Registration Failed')
            }
            errRef.current.focus();
        }
    }

    return (
        <div className={`wrapper${action}`}>
            <div className="form-box login">
                <form action="">
                    <h1>Login</h1>
                    <div className="input-box">
                        <input type="text" 
                        placeholder='Username' required />
                        <FaUser className='icon'/>
                    </div>
                    <div className="input-box">
                        <input type="password" 
                        placeholder='Password' required />
                        <FaLock className='icon'/>
                    </div>
                    <button type="submit">Login</button>
                    <div className="signup-link">
                        <p>Don't have an account?  <a href="#" onClick={signupLink}>Sign up</a></p>
                    </div>
                </form>
            </div>
            <div className="form-box signup">
                <form action="">
                    <h1>Register Now</h1>
                    <form onSubmit={handleSubmit}>
                        <div className="input-box">
                            <input type="text" 
                            placeholder='Name' required />
                            <MdDriveFileRenameOutline className='icon'/>
                        </div>
                        <div className="input-box">
                            <input type="text" 
                            placeholder='Email' required />
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
                                style={{ color: textColor }}                        
                                aria-invalid={validName ? "false" : "true"}
                                aria-describedby="uidnote"
                                onFocus={() => setUserFocus(true)}
                                onBlur={() => setUserFocus(false)}
                            />
                            <FaUser className='icon'/>
                        </div>
                        <p id="uidnote" className={userFocus && user && !validName ? "instructions" : "offscreen"}>
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
                        <button disabled={!validName || !validPwd || !validMatch ? true : false}>Sign Up</button>
                    </form>
                
                    <div className="signup-link">
                        <p>Already have an account?  <a href="#" onClick={loginLink}>Login</a></p>
                    </div>
                </form>
            </div>
        </div>

    );
};

export default LoginSignup;