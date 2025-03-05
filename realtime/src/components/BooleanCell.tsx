import React from "react";

type BooleanCellProps = {
  value: boolean;
  onChange: (newValue: boolean) => void;
};

const BooleanCell: React.FC<BooleanCellProps> = ({ value, onChange }) => {
  return (
    <input
      type="checkbox"
      checked={value}
      onChange={(e) => onChange(e.target.checked)}
    />
  );
};

export default BooleanCell;