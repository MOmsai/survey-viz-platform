import React, { useState } from 'react';
import { Container, Typography } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'https://survey-viz-platform-backend.onrender.com';

const FileUpload = ({ onDataLoaded }) => {
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const handleUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    const formData = new FormData();
    formData.append('file', selectedFile);
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to upload files');
      navigate('/login');
      return;
    }
    try {
      const res = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      });
      onDataLoaded(res.data.data);
      alert('File uploaded successfully');
    } catch (err) {
      console.error('Upload error:', err);
      if (err.response?.status === 401) {
        alert('Session expired. Please log in again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        alert('File upload failed');
      }
    }
  };

  return (
    <Container>
      <Typography variant="h6" gutterBottom>Upload Excel File</Typography>
      <input type="file" accept=".xlsx, .xls" onChange={handleUpload} />
      {file && <Typography variant="body2" sx={{ mt: 1 }}>Selected: {file.name}</Typography>}
    </Container>
  );
};

export default FileUpload;