import PropTypes from "prop-types";
import { useState } from "react";
import DurationPicker from "./DurationPicker";

const AddModal = ({ setIsModalOpen, setData }) => {
  const [formData, setFormData] = useState({
    title: "",
    duration: { minutes: 0, seconds: 0 },
    isDualTimer: false, // Initialize as boolean
  });
  const [showError, setShowError] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "minutes" || name === "seconds") {
      setFormData((prev) => ({
        ...prev,
        duration: { ...prev.duration, [name]: parseInt(value, 10) || 0 },
      }));
    } else if (name === "isDualTimer") {
      setFormData((prev) => ({
        ...prev,
        isDualTimer: value === "true", // Convert string to boolean
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAdd = () => {
    if (formData.title && formData.duration.minutes !== "" && formData.duration.seconds !== "") {
      setData((prevData) => [
        ...prevData,
        {
          ...formData,
          duration: formData.duration.minutes * 60 + formData.duration.seconds,
        },
      ]);
      setIsModalOpen(false);
    } else {
      setShowError(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
      <div className="w-2/5 lg:w-1/5 bg-white p-8 rounded-md shadow-md relative">
        {/* Close button at the top right */}
        <button
          className="absolute top-2 right-2 text-gray-600"
          onClick={() => setIsModalOpen(false)}
        >
          &times;
        </button>

        <h2 className="text-lg font-bold mb-4">新增环节</h2>

        <div className="w-full mb-4">
          <label className="block mb-2">环节名称</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="input w-full border border-slate-400 rounded p-4"
          />
        </div>

        <div className="w-full mb-4">
          <label className="block mb-2">
            双人环节
            <span
              className="ml-2"
              title="若双方都参与当前环节，如对辩、自由辩，请勾选“是”。"
            >
              ?
            </span>
          </label>
          <select
            name="isDualTimer" // Updated name
            value={formData.isDualTimer ? "true" : "false"} // Convert boolean to string for display
            onChange={handleInputChange}
            className="tw-select tw-w-full"
          >
            <option value="true">是</option>
            <option value="false">否</option>
          </select>
        </div>

        <DurationPicker
          duration={formData.duration}
          handleInputChange={handleInputChange}
        />

        {showError && <p className="text-red-500">请填写所有必填项</p>}
        <button className="btn btn-primary" onClick={handleAdd}>
          Add
        </button>
      </div>
    </div>
  );
};

AddModal.propTypes = {
  setIsModalOpen: PropTypes.func.isRequired,
  setData: PropTypes.func.isRequired,
};

export default AddModal;

