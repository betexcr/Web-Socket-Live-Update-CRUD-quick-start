import React from "react";
import { RelatedObject } from "../types/DataTypes";

type SelectCellProps = {
  value: number;
  options: RelatedObject[];
  onChange: (newValue: number) => void;
};

const SelectCell: React.FC<SelectCellProps> = ({ value, options, onChange }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    >
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default SelectCell;