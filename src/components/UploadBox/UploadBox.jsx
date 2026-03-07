import { useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import './UploadBox.css';

export default function UploadBox({ onUpload, accept = '*', label = 'Upload file' }) {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const inputRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) { setFile(f); onUpload?.(f); }
  };

  const handleChange = (e) => {
    const f = e.target.files[0];
    if (f) { setFile(f); onUpload?.(f); }
  };

  const clear = () => {
    setFile(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div
      className={`upload-box ${dragOver ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => !file && inputRef.current?.click()}
      role="button"
      tabIndex={0}
      aria-label={label}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="upload-input"
        aria-hidden="true"
      />
      {!file ? (
        <>
          <Upload size={32} className="upload-icon" />
          <div className="upload-text">
            <span className="upload-primary">Drag & drop file here</span>
            <span className="upload-secondary">or click to browse</span>
          </div>
        </>
      ) : (
        <div className="upload-file-info">
          <CheckCircle size={20} className="upload-success-icon" />
          <FileText size={16} />
          <span className="upload-filename">{file.name}</span>
          <button className="upload-clear" onClick={(e) => { e.stopPropagation(); clear(); }} aria-label="Remove file">
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
