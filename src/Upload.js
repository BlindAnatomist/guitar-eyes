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
      <label htmlFor="file-upload">Upload tablature file:</label>{" "}
      <input
        id="file-upload"
        type="file"
        aria-describedby="file-upload-help"
        disabled={disabled}
        onChange={handleFileChange}
      />
      <p id="file-upload-help">
        Guitar Eyes checks the selected file after selection and gives an explicit message
        when its format is unsupported.
      </p>
    </div>
  );
}

export default Upload;
