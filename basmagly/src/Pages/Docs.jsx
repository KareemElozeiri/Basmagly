import React, { useEffect, useState } from "react";
import { BiTrash } from "react-icons/bi";
import axios from "../APIs/axios"; // Adjust the path as necessary
import Cookies from "js-cookie"; // Assuming cookies are used for authentication
import './Docs.css'; // Add a specific style file for the Documents page

const Documents = () => {

    const BASEURL = 'http://127.0.0.1:8000/';
    
    const [documents, setDocuments] = useState([]);
    const [file, setFile] = useState(null);
    const [errMsg, setErrMsg] = useState("");

    // Fetch user documents
    const fetchDocuments = async () => {
        try {
        const authToken = Cookies.get("authToken");
        const response = await axios.get(BASEURL+"documents/", {
            headers: { Authorization: `Token ${authToken}` },
        });
        setDocuments(response.data.documents);
        } catch (error) {
        setErrMsg("Failed to fetch documents. Please try again.");
        }
    };

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
        const response = await axios.post(BASEURL+"documents/upload", formData, {
            headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "multipart/form-data",
            },
        });

        if (response.status === 201) {
            setErrMsg("");
            fetchDocuments();
        }
        } catch (error) {
        setErrMsg("Failed to upload document. Please try again.");
        }
    };

    // Handle document deletion
    const handleDelete = async (docId) => {
        try {
        const authToken = Cookies.get("authToken");
        const response = await axios.delete(`${BASEURL}documents/${docId}`, {
            headers: { Authorization: `Bearer ${authToken}` },
        });

        if (response.status === 200) {
            setErrMsg("");
            setDocuments((prevDocs) => prevDocs.filter((doc) => doc.id !== docId));
        }
        } catch (error) {
        setErrMsg("Failed to delete document. Please try again.");
        }
    };

    return (
        <div className="documents-section">
        <h1>Manage Your Documents</h1>
        
        <div className="upload-section">
            <input type="file" onChange={(e) => setFile(e.target.files[0])} />
            <button onClick={handleUpload}>Upload</button>
            {errMsg && <p className="error-message">{errMsg}</p>}
        </div>

        <div className="documents-list">
            {documents.length > 0 ? (
            documents.map((doc) => (
                <div key={doc.id} className="document-item">
                <div>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                    {doc.name}
                    </a>
                </div>
                <button onClick={() => handleDelete(doc.id)}>
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
