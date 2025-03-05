import React from "react";

type ColorPickerCellProps = {
  value: string; // Hex color code
  onChange: (newValue: string) => void;
};

const ColorPickerCell: React.FC<ColorPickerCellProps> = ({ value, onChange }) => {
  return (
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

export default ColorPickerCell;