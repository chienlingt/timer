import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import AddModal from "./AddRecord/AddModal";
import { processJsonFile } from "./jsonHandler";

const Modal = ({ isOpen, onClose, setSessions }) => {
  const [jsonFile, setJsonFile] = useState(null);
  const [data, setData] = useState([]);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [view, setView] = useState("upload");

  const containerRef = useRef(null);

  const [settings, setSettings] = useState({
    coverBackground: 'src/assets/计时器封面画面-02.png',
    defaultBackground: 'src/assets/计时器待机画面-02.png',
    positiveColor: '#0230FA', // Default blue for 正
    negativeColor: '#A3FA01', // Default red for 反
    fontStyle: 'font-sans', // Default font style
  });
  
  const handleSettingsChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  

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
      const scrollSpeed = 2;

      // Scroll up when near the top
    if (clientY < top + 50) {
      container.scrollBy(0, -scrollSpeed);
    }

    // Scroll down when near the bottom
    if (clientY > bottom - 500) {
      container.scrollBy(0, scrollSpeed);
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
        <div className="flex justify-start mb-4">
          <button
            className={`px-4 py-2 ${view === "upload" ? "bg-blue-500" : "bg-gray-300"} text-white rounded`}
            onClick={() => setView("upload")}
          >
            打开赛制
          </button>
          <button
            className={`px-4 py-2 ${view === "customize" ? "bg-blue-500" : "bg-gray-300"} text-white rounded ml-2`}
            onClick={() => setView("customize")}
          >
            编辑赛制
          </button>
          <button
            className={`px-4 py-2 ${view === "setting" ? "bg-blue-500" : "bg-gray-300"} text-white rounded ml-2`}
            onClick={() => setView("setting")}
          >
            自定义设置
          </button>
        </div>

        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto"
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
            </div>
          )}

          {view === "customize" && (
            <div className="flex-1 overflow-y-auto pb-20" ref={containerRef} onDragOver={allowDrop}>
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


            <div className="absolute bottom-0 right-0 bg-white p-4 w-full flex justify-end">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded mr-2"
                onClick={() => setIsAddModalOpen(true)}
              >
                新增环节
              </button>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded"
                onClick={handleSave}
              >
                保存
              </button>
            </div>
          </div>  
          )}

        {view === "setting" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">自定义设置</h2>
            <div>
              <label className="block text-gray-700">封面背景:</label>
              <input
                type="file"
                accept="image/*"
                className="w-57 border rounded p-2"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      handleSettingsChange('coverBackground', event.target.result);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              {settings.coverBackground && (
                <img
                  src={settings.coverBackground}
                  alt="封面背景预览"
                  className="mt-2 w-57 h-32 object-cover rounded"
                />
              )}
            </div>

            <div>
              <label className="block text-gray-700">默认背景:</label>
              <input
                type="file"
                accept="image/*"
                className="w-57 border rounded p-2"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      handleSettingsChange('defaultBackground', event.target.result);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              {settings.defaultBackground && (
                <img
                  src={settings.defaultBackground}
                  alt="默认背景预览"
                  className="mt-2 w-57 h-32 object-cover rounded"
                />
              )}
            </div>

            <div>
              <label className="block text-gray-700">正方颜色:</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  className="border rounded p-2 cursor-pointer"
                  value={settings.positiveColor}
                  onChange={(e) => handleSettingsChange('positiveColor', e.target.value)}
                  style={{ backgroundColor: settings.positiveColor }}
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700">反方颜色:</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  className="border rounded p-2 "
                  value={settings.negativeColor}
                  onChange={(e) => handleSettingsChange('negativeColor', e.target.value)}
                  style={{ backgroundColor: settings.negativeColor }}
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700">字体样式:</label>
              <select
                className="w-full border rounded p-2"
                value={settings.fontStyle}
                onChange={(e) => handleSettingsChange('fontStyle', e.target.value)}
              >
                <option value="font-sans">无衬线 (Sans)</option>
                <option value="font-serif">衬线 (Serif)</option>
                <option value="font-mono">等宽 (Monospace)</option>
              </select>
            </div>
          </div>
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