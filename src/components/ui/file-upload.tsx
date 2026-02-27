import React from "react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, accept }) => {
  return (
    <label className="block cursor-pointer">
      <span className="inline-block px-3 py-2 bg-primary text-white rounded shadow hover:bg-primary/80 transition">Upload Photo</span>
      <input
        type="file"
        accept={accept || "image/*"}
        className="hidden"
        onChange={e => {
          if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
          }
        }}
      />
    </label>
  );
};
