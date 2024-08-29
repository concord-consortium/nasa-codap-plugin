import React from "react";
import { clsx } from "clsx";

import CheckboxSVG from "../assets/images/checkbox.svg";

import "./checkbox.scss";

interface ICheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

// Checkbox component that uses custom CheckoboxSVG instead of the default input style.
export const Checkbox = ({ checked, onChange, label, disabled }: ICheckboxProps) => {
  const handleClick = () => {
    onChange(!checked);
  };

  return (
    <div className={clsx("custom-checkbox", { disabled })} onClick={handleClick}>
      <CheckboxSVG className={clsx("checkbox-icon", { checked })} />
      <label>{ label }</label>
    </div>
  );
}
