import React from "react";

import "./square-button.scss";

interface ISquareButtonProps {
  onClick?: () => void;
  children?: React.ReactNode;
}

export const SquareButton = (props: ISquareButtonProps) => {
  const { children, onClick } = props;
  return (
    <button onClick={onClick} className="square-button">
      { children }
    </button>
  );
}
