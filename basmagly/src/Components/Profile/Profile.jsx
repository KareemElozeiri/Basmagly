import React, { useEffect, useState } from "react";
import axios from "../../APIs/axios";
import "./Profile.css";

const ProfilePage = () => {

  const BASEURL = 'http://127.0.0.1:8000/';

  const [userData, setUserData] = useState({
    name: "",
    username: "",
    email: "",
    profilePhoto: "https://via.placeholder.com/150",
  });

  const [sidebarData, setSidebarData] = useState({
    name: "Alexa Rawles",
    username: "alexarawles",
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
  });

  const [activeForm, setActiveForm] = useState("profile"); // Track which form is active

  useEffect(() => {
    document.title = "profile";

    const fetchUserData = async () => {
      try {
        const response = await axios.get(BASEURL+"get_user_info/");
        const { name, username, email, profilePhoto } = response.data;

        setUserData({
          name: name || "",
          username: username || "",
          email: email || "",
          profilePhoto: profilePhoto || "https://via.placeholder.com/150",
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSaveChanges = async () => {
    try {
      await axios.put(BASEURL+"update-username/", {
        name: userData.name,
        username: userData.username,
        email: userData.email,
      });

      setSidebarData({
        name: userData.name,
        username: userData.username,
      });

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  const handlePasswordUpdate = async () => {
    try {
      await axios.post(BASEURL+"update-password/", {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordData({
        oldPassword: "",
        newPassword: "",
      });

      alert("Password updated successfully!");
    } catch (error) {
      console.error("Error updating password:", error);
      alert("Failed to update password. Please try again.");
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("profilePhoto", file);

      try {
        const response = await axios.post(BASEURL+"update-profile-picture/", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        setUserData((prevData) => ({
          ...prevData,
          profilePhoto: response.data.profilePhoto,
        }));

        alert("Profile photo updated successfully!");
      } catch (error) {
        console.error("Error uploading profile photo:", error);
        alert("Failed to upload profile photo. Please try again.");
      }
    }
  };

  return (
    <div className="profile-container">
        {/* Navbar Section */}
        <nav className="navbar">
            <button className="nav-button" onClick={() => (window.location.href = "/home/default")}>
            Home
            </button>
            <button className="nav-button" onClick={() => (window.location.href = "/")}>
            Logout
            </button>
        </nav>
        <div className="content">
            {/* Sidebar Section */}
            <aside className="profile_sidebar">
            <img
                src={userData.profilePhoto}
                alt="User"
                className="profile-image"
            />
            <h2>{sidebarData.name}</h2>
            <h3>@{sidebarData.username}</h3>
            <button className="sidebar-button" onClick={() => setActiveForm("profile")}>
                Edit Personal Info
            </button>
            <button className="sidebar-button" onClick={() => setActiveForm("password")}>
                Change Password
            </button>
            </aside>

            {/* Main Content Section */}
            <main className="profile-form">
            {activeForm === "profile" && (
                <>
                <div className="form-group">
                    <label>Name</label>
                    <input
                    type="text"
                    name="name"
                    value={userData.name}
                    onChange={handleInputChange}
                    placeholder="Your Name"
                    />
                </div>
                <div className="form-group">
                    <label>Username</label>
                    <input
                    type="text"
                    name="username"
                    value={userData.username}
                    onChange={handleInputChange}
                    placeholder="Your Username"
                    />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input
                    type="email"
                    name="email"
                    value={userData.email}
                    disabled
                    placeholder="Your Email Address"
                    />
                </div>
                <div className="form-group">
                    <label>Update Profile Photo</label>
                    <input
                    type="file"
                    onChange={handlePhotoUpload}
                    />
                </div>
                <button className="update-button" onClick={handleSaveChanges}>
                    Save Changes
                </button>
                </>
            )}

            {activeForm === "password" && (
                <>
                <h3>Update Password</h3>
                <div className="form-group">
                    <label>Old Password</label>
                    <input
                    type="password"
                    name="oldPassword"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter Old Password"
                    />
                </div>
                <div className="form-group">
                    <label>New Password</label>
                    <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter New Password"
                    />
                </div>
                <button className="update-button" onClick={handlePasswordUpdate}>
                    Update Password
                </button>
                </>
            )}
            </main>
        </div>
        </div>
    );
};

export default ProfilePage;
