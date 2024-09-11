import PropTypes from "prop-types";

const TimeRadioOptions = ({ timeUnit, setTimeUnit }) => {
  const options = ["秒", "分钟和秒", "常见"];

  return (
    <div className="flex">
      {options.map((option) => (
        <label key={option} className="mr-8">
          <input
            type="radio"
            value={option}
            checked={timeUnit === option}
            onChange={() => setTimeUnit(option)}
            className="mr-1"
          />
          {option}
        </label>
      ))}
    </div>
  );
};

TimeRadioOptions.propTypes = {
  timeUnit: PropTypes.string.isRequired,
  setTimeUnit: PropTypes.func.isRequired,
};

export default TimeRadioOptions;
