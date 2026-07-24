import React from "react";

function Upload({ onFileUpload, disabled = false }) {
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <div className="upload-control">
      <label htmlFor="file-upload">Upload .txt file:</label>{" "}
      <input
        id="file-upload"
        type="file"
        accept=".txt,text/plain"
        disabled={disabled}
        onChange={handleFileChange}
      />
    </div>
  );
}

export default Upload;
