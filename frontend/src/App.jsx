import { useState } from "react";
import FileUpload from "./Components/FileUpload";

function App() {
  const [mode, setMode] = useState("single"); // "single" or "bulk"

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">AI Resume Scanner</h1>
      <div className="mb-4">
        <button
          onClick={() => setMode("single")}
          className={`px-4 py-2 rounded ${mode === "single" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Single Resume Upload
        </button>
        <button
          onClick={() => setMode("bulk")}
          className={`px-4 py-2 rounded ml-4 ${mode === "bulk" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Bulk Resume Upload
        </button>
      </div>
      <FileUpload mode={mode} /> {/* Pass mode as a prop */}
    </div>
  );
}

export default App;