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
        accept=".txt,.tab,.musicxml,.xml,.mxl,.gtp,.gp3,.gp4,.gp5,.gpx,.gp,.ptb,.pt2,.tg,.tef,text/plain,application/xml,text/xml"
        disabled={disabled}
        onChange={handleFileChange}
      />
    </div>
  );
}

export default Upload;
