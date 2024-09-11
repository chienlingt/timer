import PropTypes from "prop-types";
import TimeInput from "./TimeInput";

const DurationPicker = ({ duration, handleInputChange }) => {
  return (
    <div className="flex">
      <TimeInput
        label="分钟"
        name="minutes"
        value={String(duration.minutes).padStart(2, "0")}
        onChange={handleInputChange}
      />
      <div>
        <p className="px-2 py-4 text-3xl font-bold">:</p>
        <p className="mt-1 my-2"></p>
      </div>
      <TimeInput
        label="秒"
        name="seconds"
        value={String(duration.seconds).padStart(2, "0")}
        onChange={handleInputChange}
      />
    </div>
  );
};

DurationPicker.propTypes = {
  duration: PropTypes.shape({
    minutes: PropTypes.number.isRequired,
    seconds: PropTypes.number.isRequired,
  }).isRequired,
  handleInputChange: PropTypes.func.isRequired,
};

export default DurationPicker;
