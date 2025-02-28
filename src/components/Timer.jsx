
// function Timer({
//   minutes,
//   seconds,
//   label,
//   isActive = false,
//   idleStyle = "text-slate-400",
//   activeStyle,
// }) {
//   return (
//     <div className="w-full h-full flex flex-col justify-center items-center">
//       <h1
//         className={`text-[1.3rem] md:text-[1.5rem] lg:text-[2rem] xl:text-[2rem] font-bold ${
//           !isActive ? idleStyle : activeStyle
//         }`}
//       >
//         {label}
//       </h1>
//       <h2
//         className={`text-[8rem] md:text-[10rem] lg:text-[12rem] xl:text-[12rem] font-bold ${
//           !isActive ? idleStyle : activeStyle
//         }`}
//       >
//         {minutes}:{String(seconds).padStart(2, "0")}
//       </h2>
//     </div>
//   );
// }


// export default Timer;

import PropTypes from "prop-types";

// function Timer({ minutes, seconds, label, isActive, idleStyle, activeStyle, settings }) {
//   const formattedTime = `${String(minutes).padStart(2, "0")}:${String(
//     seconds
//   ).padStart(2, "0")}`;

//   // Handle both string className and color value
//   const getStyle = () => {
//     if (isActive) {
//       // If activeStyle is a hex color or other color value
//       if (activeStyle.startsWith('#') || activeStyle.startsWith('rgb')) {
//         return { color: activeStyle };
//       }
//       // If it's a Tailwind class
//       return {};
//     }
//     return {};
//   };

//   // Determine which class to use based on active state
//   const getClassName = () => {
//     if (isActive) {
//       // If activeStyle is a Tailwind class (doesn't start with # or rgb)
//       if (!activeStyle.startsWith('#') && !activeStyle.startsWith('rgb')) {
//         return activeStyle;
//       }
//       return '';
//     }
//     return idleStyle;
//   };

//   return (
//     <div className="w-full h-full flex flex-col justify-center items-center">
//       {label && <div className="text-[1.3rem] md:text-[1.5rem] lg:text-[2rem] xl:text-[2rem] font-bold text-white">{label}</div>}
//       <div
//         className={`text-[8rem] md:text-[10rem] lg:text-[12rem] xl:text-[12rem] font-bold ${getClassName()}`}
//         style={getStyle()}
//       >
//         {formattedTime}
//       </div>
//     </div>
//   );
// }

function Timer({ minutes, seconds, label, isActive, idleStyle, activeStyle, settings, labelStyle = {} }) {
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;

  // Handle both string className and color value
  const getStyle = () => {
    if (isActive) {
      // If activeStyle is a hex color or other color value
      if (activeStyle.startsWith('#') || activeStyle.startsWith('rgb')) {
        return { color: activeStyle };
      }
      // If it's a Tailwind class
      return {};
    }
    return {};
  };

  // Determine which class to use based on active state
  const getClassName = () => {
    if (isActive) {
      // If activeStyle is a Tailwind class (doesn't start with # or rgb)
      if (!activeStyle.startsWith('#') && !activeStyle.startsWith('rgb')) {
        return activeStyle;
      }
      return '';
    }
    return idleStyle;
  };

  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      {label && (
        <div 
          className="text-[1.3rem] md:text-[1.5rem] lg:text-[2rem] xl:text-[2rem] font-bold" 
          style={labelStyle}
        >
          {label}
        </div>
      )}
      <div
        className={`text-[8rem] md:text-[10rem] lg:text-[12rem] xl:text-[12rem] font-bold ${getClassName()}`}
        style={getStyle()}
      >
        {formattedTime}
      </div>
    </div>
  );
}

Timer.propTypes = {
  minutes: PropTypes.number.isRequired,
  seconds: PropTypes.number.isRequired,
  label: PropTypes.string,
  isActive: PropTypes.bool.isRequired,
  idleStyle: PropTypes.string,
  activeStyle: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  settings: PropTypes.object.isRequired,
  labelStyle: PropTypes.object
};

export default Timer;