import PropTypes from "prop-types";
import BaseTimeInput from "./BaseTimeInput";

const TimeInputMinutesAndSeconds = ({ minutes, seconds, handleChange }) => (
  <div className="flex mt-2">
    <BaseTimeInput
      type="number"
      className="w-1/2"
      value={minutes || ""}
      onChange={handleChange}
      name="customMinutes"
      placeholder="分钟"
    />
    <span className="ml-2">分钟</span>
    <BaseTimeInput
      type="number"
      className="w-1/2"
      value={seconds || ""}
      onChange={handleChange}
      name="customMinutes"
      placeholder="分钟"
    />
    <span className="ml-2">秒</span>
  </div>
);

TimeInputMinutesAndSeconds.propTypes = {
  minutes: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  seconds: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  handleChange: PropTypes.func.isRequired,
};

export default TimeInputMinutesAndSeconds;
