import React from "react";

import "./square-button.scss";

interface ISquareButtonProps {
  onClick?: () => void;
  children?: React.ReactNode;
  disabled?: boolean;
}

export const SquareButton = (props: ISquareButtonProps) => {
  const { children, onClick, disabled } = props;
  return (
    <button onClick={onClick} className="square-button" disabled={disabled}>
      { children }
    </button>
  );
}
