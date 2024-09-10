import React, { useState, useEffect } from "react";
import { clsx } from "clsx";
import DropdownArrow from "../assets/images/dropdown-arrow-icon.svg";

import "./dropdown.scss";

export interface IOption {
  name: string;
  value?: string;
}

interface IDropdownProps<T extends IOption> {
  value: string;
  options: T[];
  onSelect: (option: T) => void;
  onSearchChange?: (value: string) => void;
  label: string;
  inputPlaceholder?: string;
  icon?: React.ReactNode;
  inline?: boolean;
  width?: string;
  dropdownOffset?: string;
}

export const Dropdown = <T extends IOption>({
  value,
  options,
  onSelect,
  onSearchChange,
  label,
  inputPlaceholder,
  icon,
  inline,
  width,
  dropdownOffset
}: IDropdownProps<T>) => {
  const [showOptions, setShowOptions] = useState(false);
  const [focusedOptionIndex, setFocusedOptionIndex] = useState(-1);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (event.target instanceof HTMLElement) {
        if (!event.target.closest(".day-length-dropdown")) {
          setShowOptions(false);
        }
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleTextInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    onSearchChange?.(newValue);
    setShowOptions(newValue.length > 3);
  };

  const handleMainButtonClick = () => {
    setShowOptions(prevState => !prevState);
  }

  const handleOptionSelect = (option: T) => {
    onSelect(option);
    setShowOptions(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement | HTMLButtonElement>) => {
    if (!showOptions) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setFocusedOptionIndex(prevIndex =>
          prevIndex < options.length - 1 ? prevIndex + 1 : prevIndex
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        setFocusedOptionIndex(prevIndex => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
        break;
      case "Enter":
        event.preventDefault();
        if (focusedOptionIndex >= 0 && focusedOptionIndex < options.length) {
          handleOptionSelect(options[focusedOptionIndex]);
        }
        break;
      case "Escape":
        setShowOptions(false);
        setFocusedOptionIndex(-1);
        break;
    }
  };

  const iconPresent = !!icon;

  return (
    <div className={clsx("day-length-dropdown-container", { inline })}>
      <div className="day-length-dropdown-label">
        <label>{ label }</label>
      </div>
      <div className="day-length-dropdown" style={{ width, marginLeft: dropdownOffset }}>
        {
          onSearchChange ? (
            <input
              type="text"
              placeholder={inputPlaceholder}
              value={value}
              onChange={handleTextInputChange}
              onKeyDown={handleKeyDown}
            />
          ) : (
            <div className="dropdown-main-button-container">
              <button
                className={clsx("dropdown-main-button", { iconPresent })}
                onClick={handleMainButtonClick}
                onKeyDown={handleKeyDown}
              >
                { value }
              </button>
              <DropdownArrow className={clsx("arrow-icon", { up: showOptions })} />
            </div>
          )
        }
        <div className="left-icon">
          { icon }
        </div>
        {
          showOptions && options.length > 0 && (
            <div className="day-length-dropdown-options">
              {
                options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleOptionSelect(option)}
                    onMouseEnter={() => setFocusedOptionIndex(index)}
                    onMouseLeave={() => setFocusedOptionIndex(-1)}
                    className={clsx({
                      focused: focusedOptionIndex === index ? "focused" : "",
                      iconPresent
                    })
                    }
                  >
                    { option.name }
                  </button>
                ))
              }
            </div>
          )
        }
      </div>
    </div>
  );
};
