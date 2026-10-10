import React, { useRef } from "react";

 function Upload({ onFileUpload }) {
 const fileInputRef = useRef(null);
 const handleFileChange = (e) => {
 const file = e.target.files[0];
 e.target.value = ""; // Allow retrying the same file after a validation error.
 if (file) { onFileUpload(file);
 }
 };

 return (
 <div>
 <label htmlFor="file-upload">
Upload .txt file:</label> <input id="file-upload" type="file" accept=".txt" ref={fileInputRef} onChange={handleFileChange} />
 </div>
 );
 }

 export default Upload;
