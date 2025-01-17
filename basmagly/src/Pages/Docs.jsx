import React, { useEffect, useState } from "react";
import { BiTrash } from "react-icons/bi";
import { FaDownload } from "react-icons/fa6";
import axios from "../APIs/axios";
import Cookies from "js-cookie";
import "./Docs.css"

const Documents = () => {
  const BASEURL = "http://127.0.0.1:8000/";
  const [documents, setDocuments] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]); // Changed to array for multiple selection
  const [file, setFile] = useState(null);
  const [errMsg, setErrMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getAuthHeaders = () => ({
    headers: { 
      Authorization: `Token ${Cookies.get("authToken")}`
    }
  });

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${BASEURL}documents/`, 
        getAuthHeaders()
      );
      
      const documentList = response.data.map(doc => ({
        id: doc.id,
        fileName: doc.file.split('/').pop(),
        file: doc.file
      }));
      
      setDocuments(documentList);
    } catch (error) {
      console.error("Error fetching documents:", error);
      setErrMsg("Failed to fetch documents. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Documents - Basmagly";
    fetchDocuments();
  }, []);

  const handleUpload = async () => {
    if (!file) {
      setErrMsg("Please select a file to upload.");
      return;
    }
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsLoading(true);
      const response = await axios.post(
        `${BASEURL}documents/upload/`, 
        formData,
        {
          ...getAuthHeaders(),
          headers: {
            ...getAuthHeaders().headers,
            "Content-Type": "multipart/form-data",
          }
        }
      );

      if (response.status === 201) {
        setErrMsg("");
        setFile(null);
        fetchDocuments();
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      setErrMsg("Failed to upload document. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (docId) => {
    try {
      setIsLoading(true);
      const response = await axios.delete(
        `${BASEURL}documents/${docId}/`,
        getAuthHeaders()
      );

      if (response.status === 204) {
        setErrMsg("");
        setSelectedDocuments(prev => prev.filter(id => id !== docId));
        await fetchDocuments();
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      setErrMsg("Failed to delete document. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (doc) => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${BASEURL}documents/${doc.id}/download/`,
        {
          ...getAuthHeaders(),
          responseType: 'blob'
        }
      );
      
      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading document:", error);
      setErrMsg("Failed to download document. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartStudy = async () => {
    if (selectedDocuments.length === 0) {
      setErrMsg("Please select at least one document to study.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(
        `${BASEURL}chat/add_documents/`,
        { document_ids: selectedDocuments },
        getAuthHeaders()
      );
      
      if (response.status === 200) {
        setErrMsg("");
        // You might want to redirect to the chat/study page here
      }
    } catch (error) {
      console.error("Error starting study session:", error);
      setErrMsg("Failed to start study session. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="documents-management">
      <h1>Manage Your Documents</h1>
      
      {/* Upload Section */}
      <div className="upload-section">
        <input 
          type="file" 
          onChange={(e) => setFile(e.target.files[0])}
          disabled={isLoading}
        />
        <button 
          className="upload-btn" 
          onClick={handleUpload}
          disabled={isLoading || !file}
        >
          Add Document
        </button>
      </div>

      {errMsg && <p className="error-message">{errMsg}</p>}

      {/* Document List Section */}
      <div className="documents-list">
        {isLoading && <p>Loading...</p>}
        
        {!isLoading && documents.length === 0 && (
          <p>No documents found. Upload a document to get started.</p>
        )}

        {!isLoading && documents.map((doc) => (
          <div key={doc.id} className="document-item">
            <input
              type="checkbox"
              checked={selectedDocuments.includes(doc.id)}
              onChange={(e) => {
                setSelectedDocuments(prev =>
                  e.target.checked
                    ? [...prev, doc.id]
                    : prev.filter(id => id !== doc.id)
                );
              }}
            />
            <span>{doc.fileName}</span>
            
            <button
              onClick={() => handleDownload(doc)}
              className="download-button"
              disabled={isLoading}
            >
              <FaDownload />
            </button>

            <button 
              onClick={() => handleDelete(doc.id)}
              className="delete-button"
              disabled={isLoading}
            >
              <BiTrash />
            </button>
          </div>
        ))}
      </div>

      <button 
        onClick={handleStartStudy}
        className="study-button"
        disabled={isLoading || selectedDocuments.length === 1}
      >
        Start Studying Selected Documents
      </button>
    </div>
  );
};

export default Documents;