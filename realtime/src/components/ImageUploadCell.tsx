import React, { useState } from "react";

type ImageUploadCellProps = {
  value: string; // URL or base64 string
  onChange: (newValue: string) => void;
};

const ImageUploadCell: React.FC<ImageUploadCellProps> = ({
  value,
  onChange,
}) => {
  const [preview, setPreview] = useState(value);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setPreview(result);
        onChange(result); // Pass the base64 string or URL to the parent
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
     {preview && !value && (
        <img
          src={preview}
          alt="Preview"
          style={{ width: "50px", height: "50px", objectFit: "cover" }}
        />
      )}

      {value && (
        <img
          src={value}
          alt="Preview"
          style={{ width: "50px", height: "50px", objectFit: "cover" }}
        />
      )}
      <input type="file" accept="image/*" onChange={handleFileChange} />
    </div>
  );
};

export default ImageUploadCell;
