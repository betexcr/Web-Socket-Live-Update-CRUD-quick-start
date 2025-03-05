import React from "react";

type DatePickerCellProps = {
  value: string; // ISO date format
  onChange: (newValue: string) => void;
};

const DatePickerCell: React.FC<DatePickerCellProps> = ({ value, onChange }) => {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

export default DatePickerCell;