import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import AddModal from "./AddRecord/AddModal";
import { processJsonFile } from "./jsonHandler";

// Helper function to get permanent image URLs using a free image hosting service
const uploadImageAndGetUrl = async (file) => {
  // For a real implementation, you would use a service like Cloudinary, Firebase Storage, or similar
  // This is a placeholder function to show the approach
  
  // Option 1: For testing, create object URL (which isn't permanent but works during the session)
  return URL.createObjectURL(file);
  
  // Option 2: In production, you'd implement an upload to an image hosting service
  // Example with FormData (you would replace with your actual upload endpoint)
  /*
  const formData = new FormData();
  formData.append('image', file);
  
  try {
    const response = await fetch('https://your-image-hosting-service.com/upload', {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    return data.imageUrl; // The permanent URL returned by the service
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
  */
};

const Modal = ({ isOpen, onClose, setSessions, settings, setSettings }) => {
  const [jsonFile, setJsonFile] = useState(null);
  const [data, setData] = useState([]);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [view, setView] = useState("upload");

  const containerRef = useRef(null);

  // Load data from localStorage when modal opens
  useEffect(() => {
    if (isOpen) {
      const savedData = localStorage.getItem('debateTimerCustomData');
      if (savedData) {
        try {
          setData(JSON.parse(savedData));
        } catch (error) {
          console.error("Error parsing saved data:", error);
        }
      }
    }
  }, [isOpen]);

  // Save data to localStorage when it changes
  useEffect(() => {
    if (data.length > 0) {
      localStorage.setItem('debateTimerCustomData', JSON.stringify(data));
    }
  }, [data]);

  // Tailwind color palette options
  const colorOptions = [
    { name: "Red", value: "rgb(239, 68, 68)", class: "bg-red-400" },
    { name: "Orange", value: "rgb(249, 115, 22)", class: "bg-orange-400" },
    { name: "Amber", value: "rgb(245, 158, 11)", class: "bg-amber-400" },
    { name: "Yellow", value: "rgb(234, 179, 8)", class: "bg-yellow-400" },
    { name: "Lime", value: "rgb(132, 204, 22)", class: "bg-lime-400" },
    { name: "Green", value: "rgb(34, 197, 94)", class: "bg-green-400" },
    { name: "Emerald", value: "rgb(16, 185, 129)", class: "bg-emerald-400" },
    { name: "Teal", value: "rgb(20, 184, 166)", class: "bg-teal-400" },
    { name: "Cyan", value: "rgb(6, 182, 212)", class: "bg-cyan-400" },
    { name: "Sky", value: "rgb(14, 165, 233)", class: "bg-sky-400" },
    { name: "Blue", value: "rgb(59, 130, 246)", class: "bg-blue-400" },
    { name: "Indigo", value: "rgb(99, 102, 241)", class: "bg-indigo-400" },
    { name: "Violet", value: "rgb(139, 92, 246)", class: "bg-violet-400" },
    { name: "Purple", value: "rgb(168, 85, 247)", class: "bg-purple-400" },
    { name: "Fuchsia", value: "rgb(217, 70, 239)", class: "bg-fuchsia-400" },
    { name: "Pink", value: "rgb(236, 72, 153)", class: "bg-pink-400" },
    { name: "Rose", value: "rgb(244, 63, 94)", class: "bg-rose-400" },
  ];

  const handleSettingsChange = async (field, value) => {
    // For file uploads that need to be processed
    if (field === 'coverBackground' || field === 'defaultBackground') {
      // If value is a File object, process it
      if (value instanceof File) {
        try {
          // Get a permanent URL for the image
          const imageUrl = await uploadImageAndGetUrl(value);
          
          if (imageUrl) {
            setSettings((prev) => ({
              ...prev,
              [field]: imageUrl,
            }));
          }
        } catch (error) {
          console.error(`Error processing ${field}:`, error);
          // Handle error (show to user, etc.)
        }
      } else {
        // If it's already a URL, just set it directly
        setSettings((prev) => ({
          ...prev,
          [field]: value,
        }));
      }
    } else {
      // For other settings, just update directly
      setSettings((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };
  
  const onDrop = (acceptedFiles) => {
    processJsonFile(
      acceptedFiles,
      setJsonFile,
      (loadedData) => {
        setData(loadedData);
        setSessions(loadedData); // Update sessions in the App component
        localStorage.setItem('debateTimerCustomData', JSON.stringify(loadedData));
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
    // Don't proceed with the save if there's no data - ADD THIS VALIDATION
    if (data.length === 0) {
      setShowError(true);
      setErrorMessage("Cannot save empty session data. Please add at least one session.");
      return;
    }

    const formattedData = data.map(item => ({
      title: item.环节名称 || item.title,
      isDualTimer: item.双方环节 || item.isDualTimer,
      duration: item.时长 || item.duration
    }));
  
    // Save to localStorage
    localStorage.setItem('debateTimerSessions', JSON.stringify(formattedData));
    
    // Also update the current sessions state
    setSessions(formattedData);
    
    // Export to file if requested
    const fileName = window.prompt("Enter the file name for export:", "data.json");
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

  const prevDataLengthRef = useRef(data.length);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      // Only scroll if data length increased (new item added)
      if (data.length > prevDataLengthRef.current) {
        container.scrollTop = container.scrollHeight;
      }
    }
    // Update previous length reference
    prevDataLengthRef.current = data.length;
  }, [data]);

  // Load custom font if it exists in settings
  useEffect(() => {
    if (settings.customFontFamily && settings.customFontUrl) {
      const fontFamily = settings.customFontFamily;
      const fontUrl = settings.customFontUrl;
      const format = settings.customFontFormat || 'truetype';
      
      // Add the font face to the document
      const style = document.createElement('style');
      style.textContent = `
        @font-face {
          font-family: '${fontFamily}';
          src: url('${fontUrl}') format('${format}');
          font-weight: normal;
          font-style: normal;
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        // Clean up when component unmounts
        document.head.removeChild(style);
      };
    }
  }, [settings.customFontFamily, settings.customFontUrl, settings.customFontFormat]);

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
              {data.length === 0 ? (
                <div className="text-center p-6 text-gray-500">
                  暂无环节数据，请添加新的环节或从文件导入
                </div>
              ) : (
                data.map((item, index) => (
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
                        <p>环节名称: {item.title || item.环节名称}</p>
                        <p>时长: {item.duration || item.时长}秒</p>
                        <p>双方环节: {(item.isDualTimer || item.双方环节) ? "是" : "否"}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(index)}
                      className="ml-4 px-2 py-1 bg-red-500 text-white rounded"
                    >
                      删除
                    </button>
                  </div>
                ))
              )}

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
            <div className="space-y-6">
              <h2 className="text-xl font-bold">自定义设置</h2>
              
              {/* Image upload sections */}
              <div>
                <label className="block text-gray-700 mb-2">封面背景:</label>
                <div className="flex space-x-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="w-57 border rounded p-2"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        await handleSettingsChange('coverBackground', file);
                      }
                    }}
                  />
                </div>
                {settings.coverBackground && (
                  <img
                    src={settings.coverBackground}
                    alt="封面背景预览"
                    className="mt-2 w-57 h-32 object-cover rounded"
                  />
                )}
              </div>

              <div>
                <label className="block text-gray-700 mb-2">默认背景:</label>
                <div className="flex space-x-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="w-57 border rounded p-2"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        await handleSettingsChange('defaultBackground', file);
                      }
                    }}
                  />
                </div>
                {settings.defaultBackground && (
                  <img
                    src={settings.defaultBackground}
                    alt="默认背景预览"
                    className="mt-2 w-57 h-32 object-cover rounded"
                  />
                )}
              </div>

              {/* Color selection sections with Tailwind colors */}
              <div>
                <label className="block text-gray-700 mb-2">正方颜色:</label>
                <div className="grid grid-cols-9 gap-2">
                  {colorOptions.map((color) => (
                    <div 
                      key={`positive-${color.name}`}
                      className={`w-full h-10 ${color.class} rounded cursor-pointer transition-all border-4 ${settings.positiveColor === color.value ? 'border-black' : 'border-transparent'}`}
                      onClick={() => handleSettingsChange('positiveColor', color.value)}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">反方颜色:</label>
                <div className="grid grid-cols-9 gap-2">
                  {colorOptions.map((color) => (
                    <div 
                      key={`negative-${color.name}`}
                      className={`w-full h-10 ${color.class} rounded cursor-pointer transition-all border-4 ${settings.negativeColor === color.value ? 'border-black' : 'border-transparent'}`}
                      onClick={() => handleSettingsChange('negativeColor', color.value)}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">自定义字体:</label>
                <input
                  type="file"
                  accept=".woff,.woff2,.ttf,.otf"
                  className="w-57 border rounded p-2"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      try {
                        // Upload font file to get permanent URL
                        const fontUrl = await uploadImageAndGetUrl(file);
                        
                        // Create a unique font family name
                        const fontFamily = `custom-font-${Date.now()}`;
                        
                        // Determine format from filename
                        const format = getFormat(file.name);
                        
                        // Update settings with all font information
                        setSettings(prev => ({
                          ...prev,
                          customFontFamily: fontFamily,
                          customFontUrl: fontUrl,
                          customFontFormat: format
                        }));
                        
                        // Dynamically add @font-face rule
                        const style = document.createElement('style');
                        style.textContent = `
                          @font-face {
                            font-family: '${fontFamily}';
                            src: url('${fontUrl}') format('${format}');
                            font-weight: normal;
                            font-style: normal;
                          }
                        `;
                        document.head.appendChild(style);
                      } catch (error) {
                        console.error('Error processing font:', error);
                      }
                    }
                  }}
                />
                <div className={`mt-4 text-xl`} 
                    style={{fontFamily: settings.customFontFamily || 'inherit'}}>
                  预览文字 / Preview Text / 0123456789
                </div>
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

function getFormat(filename) {
  if (filename.endsWith('.woff2')) return 'woff2';
  if (filename.endsWith('.woff')) return 'woff';
  if (filename.endsWith('.ttf')) return 'truetype';
  if (filename.endsWith('.otf')) return 'opentype';
  return 'truetype'; // default
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  setSessions: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
  setSettings: PropTypes.func.isRequired,
};

export default Modal;