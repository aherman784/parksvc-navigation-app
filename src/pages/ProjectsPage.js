import React, { useRef } from 'react';
import './ProjectsPage.css';

const ProjectsPage = () => {
  const fileInputRef = useRef(null);

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="projects-container">
      <h1>Projects Page</h1>
      <button className="upload-button" onClick={handleUploadClick}>
        Upload File
      </button>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept='.kml,.kmz'
      />
      <p>This is a placeholder for the Projects page.</p>
    </div>
  );
};

export default ProjectsPage;
