import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Tooltip as ReactTooltip } from "react-tooltip";
import NameInput from "../NameState/NameInput";
import TimeInput from "../TimeState/TimeInput";
import DualPersonInput from "./DualPersonInput";
import { convertTimeToSeconds } from "../TimeConversion";

const requiredFields = ["环节名称", "双人环节", "环节用时"];

const AddRecordForm = ({ onAddRecord, onClose }) => {
  const [newRecord, setNewRecord] = useState({ 双人环节: "否", 间隔: "是" });
  const [timeUnit, setTimeUnit] = useState("秒");
  const [errorMessage, setErrorMessage] = useState("");
  const [环节名称, set环节名称] = useState({
    持方: "",
    间隔: "",
    辩位: "",
    环节: "",
  });
  const [customTime, setCustomTime] = useState({
    customMinutes: "",
    customSeconds: "",
  });

  useEffect(() => {
    if (
      环节名称.辩位 &&
      环节名称.环节 &&
      (newRecord.双人环节 === "是" || (环节名称.持方 && 环节名称.间隔))
    ) {
      setNewRecord((prevRecord) => ({
        ...prevRecord,
        环节名称: `${环节名称.持方}${环节名称.辩位}${环节名称.间隔}${环节名称.环节}`,
      }));
    }
  }, [环节名称, newRecord.双人环节]);

  const handleAddRecord = () => {
    const currentRequiredFields = [...requiredFields];
    if (newRecord.双人环节 === "否") {
      currentRequiredFields.push("持方", "间隔");
    }

    if (currentRequiredFields.every((field) => newRecord[field])) {
      const recordToAdd = { ...newRecord };
      recordToAdd["环节用时"] = convertTimeToSeconds(
        timeUnit,
        customTime,
        newRecord["环节用时"]
      );
      onAddRecord(recordToAdd);
      resetForm();
    } else {
      setErrorMessage("所有字段都是必填的");
    }
  };

  const resetForm = () => {
    setNewRecord({ 双人环节: "否", 间隔: "是" });
    set环节名称({ 持方: "", 间隔: "", 辩位: "", 环节: "" });
    setCustomTime({ customMinutes: "", customSeconds: "" });
    setErrorMessage("");
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-xl max-w-md w-full p-6">
      <h3 className="text-lg font-medium mb-4">添加新环节</h3>
      <DualPersonInput
        value={newRecord["双人环节"]}
        onChange={(e) =>
          setNewRecord({ ...newRecord, 双人环节: e.target.value })
        }
      />
      <NameInput
        双人环节={newRecord["双人环节"]}
        环节名称={环节名称}
        set环节名称={set环节名称}
      />
      <TimeInput
        timeUnit={timeUnit}
        customTime={customTime}
        setCustomTime={setCustomTime}
        newRecord={newRecord}
        setNewRecord={setNewRecord}
        setTimeUnit={setTimeUnit}
      />
      <ReactTooltip />
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleAddRecord}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Add
        </button>
      </div>
    </div>
  );
};

AddRecordForm.propTypes = {
  onAddRecord: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AddRecordForm;
