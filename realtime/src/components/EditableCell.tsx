import React, { useState } from "react";

type EditableCellProps = {
  value: any;
  onChange: (newValue: any) => void;
};

const EditableCell: React.FC<EditableCellProps> = ({ value, onChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);

  const handleBlur = () => {
    setIsEditing(false);
    if (currentValue !== value) {
      onChange(currentValue);
    }
  };

  return isEditing ? (
    <input
      type="text"
      value={currentValue}
      onChange={(e) => setCurrentValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === "Escape") handleBlur();
      }}
      autoFocus
    />
  ) : (
    <div onDoubleClick={() => setIsEditing(true)} style={{ cursor: "pointer" }}>
      {value}
    </div>
  );
};

export default EditableCell;