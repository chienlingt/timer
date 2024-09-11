import PropTypes from "prop-types";
import TimeSelect from "./TimeSelect";
import TimeInputSeconds from "./TimeInputSeconds";
import TimeInputMinutesAndSeconds from "./TimeInputMinutesAndSeconds";

const TimeInputFields = ({
  timeUnit,
  customTime,
  handleTimeChange,
  newRecord,
}) => (
  <>
    {timeUnit === "秒" && (
      <TimeInputSeconds
        value={newRecord.环节用时 ? String(newRecord.环节用时) : ""}
        handleChange={handleTimeChange}
      />
    )}
    {timeUnit === "分钟和秒" && (
      <TimeInputMinutesAndSeconds
        minutes={
          customTime.customMinutes ? String(customTime.customMinutes) : ""
        }
        seconds={
          customTime.customSeconds ? String(customTime.customSeconds) : ""
        }
        handleChange={handleTimeChange}
      />
    )}
    {timeUnit === "常见" && (
      <TimeSelect
        value={newRecord.环节用时 ? String(newRecord.环节用时) : ""}
        handleChange={handleTimeChange}
      />
    )}
  </>
);

TimeInputFields.propTypes = {
  timeUnit: PropTypes.string.isRequired,
  customTime: PropTypes.object.isRequired,
  handleTimeChange: PropTypes.func.isRequired,
  newRecord: PropTypes.object.isRequired,
};

export default TimeInputFields;
