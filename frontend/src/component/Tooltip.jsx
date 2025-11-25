import React from "react";

const Tooltip = ({ text, children, position = "bottom" }) => {
  let containerClass = "top-full left-1/2 -translate-x-1/2 mt-2"; // default bottom
  let arrowClass = "absolute bottom-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-b-gray-800";

  if (position === "top") {
    containerClass = "bottom-full left-1/2 -translate-x-1/2 mb-2";
    arrowClass = "absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-gray-800";
  } else if (position === "left") {
    containerClass = "right-full top-1/2 -translate-y-1/2 mr-2";
    arrowClass = "absolute right-[-5px] top-1/2 -translate-y-1/2 border-[5px] border-transparent border-l-gray-800";
  } else if (position === "right") {
    containerClass = "left-full top-1/2 -translate-y-1/2 ml-2";
    arrowClass = "absolute left-[-5px] top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-gray-800";
  }

  return (
    <div className="relative inline-block group">
      {children}
      <div
        className={`absolute ${containerClass} w-max px-2 py-1 text-white text-sm bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50`}
      >
        {text}
        <span className={arrowClass}></span>
      </div>
    </div>
  );
};

export default Tooltip;
