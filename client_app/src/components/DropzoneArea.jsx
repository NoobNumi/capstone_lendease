import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';

const DropzoneArea = ({ className, fieldName, files, dropzoneProps, setFieldValue, errors }) => {
  const [preview, setPreview] = useState(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    ...dropzoneProps,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setFieldValue(fieldName, file);

        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);
      }
    },
  });

  // Cleanup preview URL when component unmounts
  React.useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  return (
    <div className="space-y-2">
      {/* Preview Area */}
      {(preview || files[fieldName]) && (
        <div className="relative h-32 w-full rounded-lg border border-gray-200 overflow-hidden mb-2">
          <img
            src={preview || URL.createObjectURL(files[fieldName])}
            alt="File preview"
            className="h-full w-full object-contain"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-1">
            <p className="text-white text-xs truncate text-center">
              {files[fieldName]?.name || 'Selected file'}
            </p>
          </div>
        </div>
      )}

      {/* Drop Zone Area */}
      <div
        {...getRootProps()}
        className={`
          cursor-pointer transition-colors duration-150
          ${isDragActive ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'}
          ${className || ''}
          border-2 border-dashed rounded-lg p-4
        `}
      >
        <input {...getInputProps()} />
        <div className="text-sm text-gray-500">
          <div className="flex flex-col items-center">
            <svg
              className="w-6 h-6 text-gray-400 mb-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            <p>{files[fieldName] ? 'Change file' : 'Drop file here or click to select'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DropzoneArea; 