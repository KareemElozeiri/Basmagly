import React, { useEffect, useState } from "react";
import { BiTrash } from "react-icons/bi";
import { FaDownload } from "react-icons/fa6";
import axios from "../APIs/axios"; // Adjust the path as necessary
import Cookies from "js-cookie"; // Assuming cookies are used for authentication
import "./Docs.css"; // Add a specific style file for the Documents page

const Documents = () => {

  const BASEURL = "http://127.0.0.1:8000/"; // Adjust base URL as necessary
  const [documents, setDocuments] = useState([]); // State to store documents
  const [file, setFile] = useState(null); // State for file uploads
  const [errMsg, setErrMsg] = useState(""); // State for error messages

  // Fetch documents from the backend
  const fetchDocuments = async () => {
    try {
      const authToken = Cookies.get("authToken");
      const response = await axios.get(`${BASEURL}documents/`, {
        headers: { Authorization: `Token ${authToken}` },
      });
      const documentList = response.data.map(doc => {
        const filePath = 'backend' + doc.file; 
        const fileName = filePath.split('/').pop(); 
        const id = doc.id; 
        return { id, filePath, fileName }; 
      });
      setDocuments(documentList);  
      console.log('documents:',documentList);
      console.log('response:',response);
    } catch (error) {
      console.error("Error fetching documents:", error);
      setErrMsg("Failed to fetch documents. Please try again.");
    }
  };

  // Effect to set page title and fetch documents
  useEffect(() => {
    document.title = "Documents - Basmagly";
    fetchDocuments();   
  }, []);

  // Handle file upload
  const handleUpload = async () => {
    if (!file) {
      setErrMsg("Please select a file to upload.");
      return;
    }
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const authToken = Cookies.get("authToken");
      const response = await axios.post(BASEURL + "documents/upload/", formData, {
        headers: {
          Authorization: `Token ${authToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201) {
        setErrMsg("");
        fetchDocuments(); // Refresh document list after successful upload
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      setErrMsg("Failed to upload document. Please try again.");
    }
  };

  // Handle document deletion
  const handleDelete = async (docId) => {
    try {
      const authToken = Cookies.get("authToken");
      const response = await axios.delete(`${BASEURL}documents/${docId}/`, {
        headers: { Authorization: `Token ${authToken}` },
        "Content-Type": "multipart/form-data",
      });

      if (response.status === 204) {
        setErrMsg("");
        setDocuments((prevDocs) => prevDocs.filter((doc) => doc.id !== docId));
        fetchDocuments();
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      setErrMsg("Failed to delete document. Please try again.");
    }
  };

  return (
    <div className="documents-section">
      <h1>Manage Your Documents</h1>
      
      {/* Upload Section */}
      <div className="upload-section">
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button className='upload-btn' onClick={handleUpload}>Add Document</button>
        {errMsg && <p className="error-message">{errMsg}</p>}
      </div>

      {/* Document List Section */}
      <div className="documents-list">
        {documents.length > 0 ? (
          documents.map((doc) => (
            <div key={doc.fileName} className="document-item">
              <div>
                  {doc.fileName}
              </div>
               {/* Download Button */}
                <button
                onClick={() => {
                    const fileUrl = `backend${doc.filePath}`; // Correctly construct the file URL
                    const anchor = document.createElement('a'); // Create an anchor element
                    anchor.href = fileUrl; // Set the file URL
                    anchor.download = doc.fileName; // Set the suggested file name for download
                    anchor.click(); // Trigger the download
                }}
                className="download-button"
                >
                <FaDownload />
                </button>


                {/* Delete Button */}
                <button onClick={() => handleDelete(doc.id)} className="delete-button">
                <BiTrash />
                </button>
            </div>
          ))
        ) : (
          <p>No documents found. Upload a document to get started.</p>
        )}
      </div>
    </div>
  );
};

export default Documents;
