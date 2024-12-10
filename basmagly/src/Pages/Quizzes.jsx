import React, {useEffect, useState} from "react";

const Quizzes = () => {

  useEffect(() => {
      document.title = "Quizzes - Basmagly"; // Set the title
  }, []); // Runs once when the component mounts

  return <h1>Quizzes Section</h1>;
  
};

export default Quizzes;
