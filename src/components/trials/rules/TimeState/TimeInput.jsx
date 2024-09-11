import PropTypes from "prop-types";
import TimeRadioOptions from "./TimeRadioOptions";
import TimeInputFields from "./TimeInputFields";

const TimeInput = ({
  timeUnit,
  customTime,
  setCustomTime,
  newRecord,
  setNewRecord,
  setTimeUnit,
}) => {
  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    if (name === "customMinutes" || name === "customSeconds") {
      setCustomTime({ ...customTime, [name]: value });
    } else {
      setNewRecord({ ...newRecord, 环节用时: value });
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-gray-700">环节用时</label>
      <TimeRadioOptions timeUnit={timeUnit} setTimeUnit={setTimeUnit} />
      <TimeInputFields
        timeUnit={timeUnit}
        customTime={customTime}
        handleTimeChange={handleTimeChange}
        newRecord={newRecord}
      />
    </div>
  );
};

TimeInput.propTypes = {
  timeUnit: PropTypes.string.isRequired,
  customTime: PropTypes.object.isRequired,
  setCustomTime: PropTypes.func.isRequired,
  newRecord: PropTypes.object.isRequired,
  setNewRecord: PropTypes.func.isRequired,
  setTimeUnit: PropTypes.func.isRequired,
};

export default TimeInput;
