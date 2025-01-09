import React from 'react';

interface CustomButtonProps {
  btnType: "button" | "submit" | "reset"; // Allowed types for the button
  title: string; // Text to display on the button
  handleClick: () => void; // Function to handle button click
  styles?: string; // Optional styles
}

const CustomButton: React.FC<CustomButtonProps> = ({ btnType, title, handleClick = () => {}, styles }) => {
  return (
    <button
      type={btnType}
      className={`font-epilogue font-semibold text-[16px] leading-[26px] text-white min-h-[52px] px-4 rounded-[10px] ${styles}`}
      onClick={handleClick}
    >
      {title}
    </button>
  );
};

export default CustomButton;
