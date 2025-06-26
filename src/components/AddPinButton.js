import React from "react";

const AddPinButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      aria-label="Add new pin"
      style={{
        position: "absolute",
        bottom: 20,
        right: 20,
        borderRadius: "50%",
        width: 50,
        height: 50,
        fontSize: 30,
        backgroundColor: "#a45ee5",
        color: "white",
        border: "none",
        cursor: "pointer",
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        zIndex: 9999,
      }}
    >
      +
    </button>
  );
};

export default AddPinButton;
