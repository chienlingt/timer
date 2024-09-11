import PropTypes from "prop-types";
import BaseTimeInput from "./BaseTimeInput";

const TimeInputSeconds = ({ value, handleChange }) => (
  <div className="flex items-center mt-2">
    <BaseTimeInput
      type="number"
      className="w-full"
      value={value || ""}
      onChange={handleChange}
      name="环节用时"
    />
    <span className="ml-2">秒</span>
  </div>
);

TimeInputSeconds.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  handleChange: PropTypes.func.isRequired,
};

export default TimeInputSeconds;
