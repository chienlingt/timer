import PropTypes from "prop-types";
import { useState } from "react";
import DurationPicker from "./DurationPicker";

const AddModal = ({ setIsModalOpen, setData }) => {
  const [formData, setFormData] = useState({
    环节名称: "",
    时长: { minutes: 0, seconds: 0 },
    双方环节: "否",
  });
  const [showError, setShowError] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "minutes" || name === "seconds") {
      setFormData((prev) => ({
        ...prev,
        时长: { ...prev.时长, [name]: parseInt(value, 10) || 0 },
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAdd = () => {
    if (formData.环节名称 && formData.时长.minutes !== "" && formData.时长.seconds !== "") {
      setData((prevData) => [
        ...prevData,
        {
          ...formData,
          时长: formData.时长.minutes * 60 + formData.时长.seconds,
        },
      ]);
      setIsModalOpen(false);
    } else {
      setShowError(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
      <div className="w-2/5 lg:w-1/5 bg-white p-8 rounded-md shadow-md">
        <h2 className="text-lg font-bold mb-4">新增环节</h2>

        <div className="w-full mb-4">
          <label className="block mb-2">环节名称</label>
          <input
            type="text"
            name="环节名称"
            value={formData.环节名称}
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
            name="双方环节"
            value={formData.双方环节}
            onChange={handleInputChange}
            className="tw-select tw-w-full"
          >
            <option value="是">是</option>
            <option value="否">否</option>
          </select>
        </div>

        <DurationPicker
          duration={formData.时长}
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

