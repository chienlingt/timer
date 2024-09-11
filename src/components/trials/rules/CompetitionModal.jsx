import PropTypes from "prop-types";
import Modal from "react-modal";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import FileInput from "./FileInput";
import RecordDisplay from "./Record/RecordDisplay";
import AddRecordForm from "./AddRecord/AddRecordForm";
import { useState } from "react";

const requiredFields = ["环节名称", "双人环节", "环节用时"];

const CompetitionModal = ({ isOpen, onClose }) => {
  const [records, setRecords] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (
          Array.isArray(json) &&
          json.every((record) =>
            requiredFields.every((field) => field in record)
          )
        ) {
          setRecords(json);
          setErrorMessage("");
        } else {
          setErrorMessage("此 JSON 文件格式并不符合赛制规则");
        }
      } catch {
        setErrorMessage("此 JSON 文件格式并不符合赛制规则");
      }
    };
    reader.readAsText(file);
  };

  const handleAddRecord = (record) => {
    setRecords([...records, record]);
    setIsAddModalOpen(false);
  };

  const handleSave = () => {
    const dataStr = JSON.stringify(records);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = "data.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const moveRecord = (dragIndex, hoverIndex) => {
    const draggedRecord = records[dragIndex];
    const updatedRecords = [...records];
    updatedRecords.splice(dragIndex, 1);
    updatedRecords.splice(hoverIndex, 0, draggedRecord);
    setRecords(updatedRecords);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Modal
        isOpen={isOpen}
        onRequestClose={onClose}
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
        overlayClassName="fixed inset-0"
      >
        <div className="bg-white rounded-lg overflow-hidden shadow-xl max-w-3xl w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">选择 JSON 文件</h3>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Add
            </button>
          </div>
          <FileInput handleFileUpload={handleFileUpload} />
          {errorMessage && <p className="text-red-500">{errorMessage}</p>}
          {records.length === 0 ? (
            <p className="mt-4 text-gray-500">
              当前并无任何环节。请点击右上方的加号增加新的环节。
            </p>
          ) : (
            <RecordDisplay records={records} moveRecord={moveRecord} />
          )}
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              Save
            </button>
          </div>
        </div>

        <Modal
          isOpen={isAddModalOpen}
          onRequestClose={() => setIsAddModalOpen(false)}
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          overlayClassName="fixed inset-0"
        >
          <AddRecordForm
            onAddRecord={handleAddRecord}
            onClose={() => setIsAddModalOpen(false)}
          />
        </Modal>
      </Modal>
    </DndProvider>
  );
};

CompetitionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CompetitionModal;
