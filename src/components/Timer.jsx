import PropTypes from "prop-types";

function Timer({ 
  minutes, 
  seconds, 
  milliseconds = 0, 
  label, 
  isActive, 
  idleStyle, 
  activeStyle, 
  settings, 
  labelStyle = {} 
}) {
  // Format time with leading zeros and two decimal places for milliseconds
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
          className="text-[2rem] md:text-[2.5rem] lg:text-[3rem] xl:text-[3rem] font-bold" 
          style={labelStyle}
        >
          {label}
        </div>
      )}
      <div
        className={`text-[8.5rem] md:text-[11rem] lg:text-[13rem] xl:text-[13rem] font-bold ${getClassName()}`}
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
  milliseconds: PropTypes.number,
  label: PropTypes.string,
  isActive: PropTypes.bool.isRequired,
  idleStyle: PropTypes.string,
  activeStyle: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  settings: PropTypes.object.isRequired,
  labelStyle: PropTypes.object
};

export default Timer;