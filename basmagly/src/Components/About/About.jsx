import "./About.css"

const AboutPage = () => {
    return (
      <div className="about-container">
        {/* Navbar Section */}
        <nav className="navbar">
            <button className="nav-button" onClick={() => (window.location.href = "/home/default")}>
            Home
            </button>
            <button className="nav-button" onClick={() => (window.location.href = "/")}>
            Logout
            </button>
        </nav>
        <h2>About Basmagly</h2>
        <p className="about-description">
          AI Study Assistant is your 24/7 learning companion, designed to revolutionize 
          how students manage their academic journey. Our platform provides comprehensive 
          support for managing study materials, answering questions, creating summaries, 
          and generating practice quizzes to enhance your learning experience.
        </p>
        
        <h3>Our Team</h3>
        <div className="team-container">
          <div className="team-member">
            <h4>Mohamed Hatem</h4>
            <p>Co-founder & Developer</p>
            <a 
              href="https://www.linkedin.com/in/mohamed-hatem-saleh/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="linkedin-link"
            >
              LinkedIn Profile
            </a>
          </div>
          
          <div className="team-member">
            <h4>Kareem ELozeiri</h4>
            <p>Co-founder & Developer</p>
            <a 
              href="https://www.linkedin.com/in/kareem-elozeiri-a09657218/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="linkedin-link"
            >
              LinkedIn Profile
            </a>
          </div>
        </div>
      </div>
    );
  };

  export default AboutPage;