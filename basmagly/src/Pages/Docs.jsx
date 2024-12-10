import React, {useEffect, useState, setDocuments} from "react";
import "./Docs.css";

const DocumentManagement = () => {

  // const documents = [
  //   { name: "Document A" },
  //   { name: "Document B" },
  //   { name: "Document C" },
  // ];

  useEffect(() => {
      document.title = "Documents - Basmagly"; // Set the title
  }, []); // Runs once when the component mounts

  const [documents, setDocuments] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleFileUpload = (event) => {
      const files = Array.from(event.target.files); // Convert FileList to Array
      const newDocuments = files.map((file) => ({
          name: file.name,       // Store the name of the file
          file: file,            // Store the file object
      }));

      // Update the documents and uploaded files state
      setDocuments([...documents, ...newDocuments]);
      setUploadedFiles([...uploadedFiles, ...files]); // Storing the actual files in a separate variable
  };

  const handleDelete = (index) => {
      // Remove the document at the specified index
      const newDocuments = documents.filter((_, i) => i !== index);
      setDocuments(newDocuments);
      // Optionally remove the file from the uploaded files as well
      const newUploadedFiles = uploadedFiles.filter((_, i) => i !== index);
      setUploadedFiles(newUploadedFiles);
  };

  const handleDownload = (file) => {
      // Trigger file download (for demonstration, using Blob)
      const link = document.createElement('a');
      link.href = URL.createObjectURL(file);
      link.download = file.name;
      link.click();
  };

  return (
      <div className="documents-container">
          <div className="documents-list">
              {documents.map((doc, index) => (
                  <div className="document-item" key={index}>
                      <div className="document-name">
                          {doc.name}
                          <button className="expand-btn">▼</button>
                      </div>
                      <div className="document-actions">
                          <button 
                              className="delete-btn" 
                              onClick={() => handleDelete(index)}
                          >
                              Delete
                          </button>
                          <button 
                              className="download-btn" 
                              onClick={() => handleDownload(doc.file)}
                          >
                              Download
                          </button>
                      </div>
                  </div>
              ))}
          </div>
          <div className="upload-container">
              <label htmlFor="file-upload" className="upload-btn">
                  Upload Your Files
              </label>
              <input
                  id="file-upload"
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="file-input"
              />
          </div>
      </div>
    );
};

export default DocumentManagement;