import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import AddModal from "./AddRecord/AddModal";
import Config from "./Config"; // Import Config component
import { processJsonFile } from "./jsonHandler";

const Modal = ({ isOpen, onClose, setSessions }) => {
  const [jsonFile, setJsonFile] = useState(null);
  const [data, setData] = useState([]);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [view, setView] = useState("upload");
  const [isConfigOpen, setIsConfigOpen] = useState(false); // State for configuration modal

  const containerRef = useRef(null);

  const onDrop = (acceptedFiles) => {
    processJsonFile(
      acceptedFiles,
      setJsonFile,
      (loadedData) => {
        setData(loadedData);
        setSessions(loadedData); // Update sessions in the App component
      },
      setShowError,
      setErrorMessage
    );
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("dragIndex", index);
  };

  const handleDrop = (e, dropIndex) => {
    const dragIndex = e.dataTransfer.getData("dragIndex");
    const items = [...data];
    const [draggedItem] = items.splice(dragIndex, 1);
    items.splice(dropIndex, 0, draggedItem);
    setData(items);
  };

  const allowDrop = (e) => {
    e.preventDefault();
  };

  const handleDelete = (index) => {
    setData((prevData) => prevData.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const formattedData = data.map(item => ({
      title: item.环节名称,
      isDualTimer: item.双方环节,
      duration: item.时长
    }));
  
    const fileName = window.prompt("Enter the file name:", "data.json");
    if (fileName) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleDrag = (e) => {
    const container = containerRef.current;
    if (container) {
      const { clientY } = e;
      const { top, bottom } = container.getBoundingClientRect();

      if (clientY < top + 50) {
        container.scrollBy(0, -10);
      } else if (clientY > bottom - 50) {
        container.scrollBy(0, 10);
      }
    }
  };

  useEffect(() => {
    const container = containerRef.current;

    if (container) {
      container.addEventListener('drag', handleDrag);

      return () => {
        container.removeEventListener('drag', handleDrag);
      };
    }
  }, []);

  useEffect(() => {
    // Scroll to the bottom whenever data changes
    const container = containerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [data]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-4 rounded-md shadow-md w-11/12 max-w-2xl relative flex flex-col h-[80vh]">
        <button
          className="absolute top-2 right-2 text-gray-600"
          onClick={onClose}
        >
          &times;
        </button>
        <div className="flex justify-between mb-4">
          <button
            className={`px-4 py-2 ${view === "upload" ? "bg-blue-500" : "bg-gray-300"} text-white rounded`}
            onClick={() => setView("upload")}
          >
            打开赛制
          </button>
          <button
            className={`px-4 py-2 ${view === "customize" ? "bg-blue-500" : "bg-gray-300"} text-white rounded`}
            onClick={() => setView("customize")}
          >
            自定义赛制
          </button>
        </div>

        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto mb-16"
          onDragOver={allowDrop}
        >
          {view === "upload" && (
            <div>
              <div {...getRootProps({ className: "dropzone" })}>
                <input {...getInputProps()} />
                <p className="cursor-pointer text-gray-700 hover:text-blue-500 transition-colors">
                  Drag and drop a .json file here, or click to select a file
                </p>
                {jsonFile && <h2 className="text-lg font-bold mt-4">JSON File: {jsonFile}</h2>}
              </div>
              {showError && <p className="text-red-500 mt-2">{errorMessage}</p>}
              {isConfigOpen && (
                <Config onClose={() => setIsConfigOpen(false)} /> // Include Config component
              )}
            </div>
          )}

          {view === "customize" && (
            <div>
              <div>
                {data.map((item, index) => (
                  <div
                    key={index}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={allowDrop}
                    onDrop={(e) => handleDrop(e, index)}
                    className="bg-white p-4 mb-2 shadow rounded-md flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className="mr-2 cursor-pointer">&#9776;</div>
                      <div>
                        <p>环节名称: {item.title}</p>
                        <p>时长: {item.duration}秒</p>
                        <p>双方环节: {item.isDualTimer ? "是" : "否"}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(index)}
                      className="ml-4 px-2 py-1 bg-red-500 text-white rounded"
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="absolute bottom-0 right-0 p-4 bg-white w-full flex justify-end">
          {view === "upload" && (
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded mr-2"
              onClick={() => setIsConfigOpen(true)} // Open Config when clicked
            >
              Customize Shortcuts
            </button>
          )}
          {view === "customize" && (
            <>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded mr-2"
                onClick={() => setIsAddModalOpen(true)}
              >
                Add
              </button>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded"
                onClick={handleSave}
              >
                Save as JSON
              </button>
            </>
          )}
        </div>

        {isAddModalOpen && (
          <AddModal setIsModalOpen={setIsAddModalOpen} setData={setData} />
        )}
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  setSessions: PropTypes.func.isRequired,
};

export default Modal;

