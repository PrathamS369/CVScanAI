import { useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";

const FileUpload = ({ mode }) => { // Receive `mode` prop from App.jsx
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [rankedResumes, setRankedResumes] = useState([]);

  // Dynamically set accepted file types
  const acceptFiles = mode === "bulk" 
    ? { "application/zip": [".zip"] } 
    : { 
        "application/pdf": [".pdf"], 
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"] 
      };

  const { getRootProps, getInputProps } = useDropzone({
    accept: acceptFiles, // Use dynamic accept based on mode
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
      setAnalysis(null);
      setError(null);
    },
  });

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAnalysis(response.data);
    } catch (error) {
      console.error("Error uploading file:", error);
      setError("Failed to upload. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:5000/upload-zip", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Rank resumes based on job description
      const rankResponse = await axios.post("http://localhost:5000/rank", {
        job_description: jobDescription,
        resumes: response.data.resumes,
      });
      setRankedResumes(rankResponse.data.ranked_resumes);
    } catch (error) {
      console.error("Error uploading file:", error);
      setError("Failed to upload. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 border rounded-lg max-w-lg mx-auto">
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Job Description</label>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          className="w-full p-2 border rounded"
          rows="4"
          placeholder="Enter job description..."
        />
      </div>

      <div
        {...getRootProps()}
        className="border-2 border-dashed p-6 text-center cursor-pointer bg-gray-50 hover:bg-gray-100"
      >
        <input {...getInputProps()} />
        {file ? <p className="font-medium text-blue-600">{file.name}</p> : <p>Drag & drop a resume (PDF/DOCX) or click to select</p>}
      </div>

      <button
        onClick={handleUpload}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        disabled={!file || loading}
      >
        {loading ? "Uploading..." : "Upload & Analyze"}
      </button>

      <button
        onClick={handleBulkUpload}
        className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400 ml-4"
        disabled={!file || loading}
      >
        {loading ? "Uploading..." : "Upload Zip & Rank"}
      </button>

      {error && <p className="mt-4 text-red-500">{error}</p>}

      {analysis && (
        <div className="mt-4 p-4 bg-gray-100 border rounded">
          <h2 className="text-lg font-bold mb-2">Extracted Data</h2>
          <pre className="whitespace-pre-wrap">{JSON.stringify(analysis, null, 2)}</pre>
        </div>
      )}

      {rankedResumes.length > 0 && (
        <div className="mt-4 p-4 bg-gray-100 border rounded">
          <h2 className="text-lg font-bold mb-2">Ranked Resumes</h2>
          <ul>
            {rankedResumes.map((resume, index) => (
              <li key={index} className="mb-2">
                <span className="font-medium">{resume.filename}</span> - <span className="text-blue-600">{resume.score}% match</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUpload;