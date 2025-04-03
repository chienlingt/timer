import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import ColorModal from "../modals/ColorModal";
import AddModal from "./AddRecord/AddModal";
import { processJsonFile } from "./jsonHandler";

const Modal = ({ isOpen, onClose, setSessions, settings, setSettings }) => {
  const [jsonFile, setJsonFile] = useState(null);
  const [data, setData] = useState([]);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [view, setView] = useState("upload");
  
  // State for color picker modal
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [currentColorSetting, setCurrentColorSetting] = useState(null);
  const [colorModalTitle, setColorModalTitle] = useState("");
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

  // Improved file handling logic with better error handling and persistence
  const handleSettingsChange = async (field, value) => {
    // For background images or fonts that need to be saved permanently
    if (field === 'coverBackground' || field === 'defaultBackground' || field === 'customFontPath') {
      // If value is a File object, process it
      if (value instanceof File) {
        try {
          // Get a permanent URL for the file using Electron's API
          if (window.electronAPI) {
            // Create a proper file type identifier
            const fileType = field;
            
            // Use FileReader to read the file data
            const fileReader = new FileReader();
            
            const fileDataPromise = new Promise((resolve) => {
              fileReader.onload = () => resolve(fileReader.result);
            });
            
            fileReader.readAsDataURL(value);
            const fileData = await fileDataPromise;
            
            // Save file through Electron and get the local file path
            const filePath = await window.electronAPI.saveFile({
              fileData,
              fileName: value.name,
              fileType: fileType
            });
            
            // Update settings with the saved path
            if (filePath) {
              const updatedSettings = { ...settings };
              updatedSettings[field] = filePath;
              setSettings(updatedSettings);
            }
          } else {
            // Fallback for web (using object URLs)
            const fileUrl = URL.createObjectURL(value);
            setSettings((prev) => ({
              ...prev,
              [field]: fileUrl,
            }));
          }
        } catch (error) {
          console.error(`Error processing ${field}:`, error);
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
  
  // Function to open color modal
  const openColorModal = (field, title) => {
    setCurrentColorSetting(field);
    setColorModalTitle(title);
    setIsColorModalOpen(true);
  };
  
  // Handle color change from ColorModal
  const handleColorChange = (color) => {
    if (currentColorSetting) {
      handleSettingsChange(currentColorSetting, color);
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
    // Don't proceed with the save if there's no data
    if (data.length === 0) {
      setShowError(true);
      setErrorMessage("");
      return;
    }

    // Preserve all properties in each item, not just the basic ones
    // This ensures that properties like 'label1' needed by App.jsx are preserved
    const formattedData = data.map(item => {
      // First, ensure we have all the required properties with their standard names
      const formattedItem = {
        title: item.环节名称 || item.title || "",
        isDualTimer: item.双方环节 || item.isDualTimer || false,
        duration: item.时长 || item.duration || 0,
        // Ensure label1 and other potentially needed properties exist
        label1: item.label1 || "",
        label2: item.label2 || "",
        // Copy any other existing properties
        ...item
      };
      
      // Standardize property names if they're in Chinese
      if (item.环节名称) formattedItem.title = item.环节名称;
      if (item.双方环节 !== undefined) formattedItem.isDualTimer = item.双方环节;
      if (item.时长) formattedItem.duration = item.时长;
      
      return formattedItem;
    });
  
    // Save to localStorage
    localStorage.setItem('debateTimerSessions', JSON.stringify(formattedData));
    
    // Also update the current sessions state
    setSessions(formattedData);
    
    // Export to file if requested
    const fileName = window.prompt("输入导出文件名:", "data.json");
    if (fileName) {
      // Export the full data with all properties
      const blob = new Blob([JSON.stringify(formattedData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || "data.json";
      a.click();
      URL.revokeObjectURL(url);
      
      // Close modal after successful save
      onClose();
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

  // Improved font handling with better format detection and error handling
  const handleFontUpload = async (file) => {
    try {
      if (window.electronAPI) {
        if (!file) {
          // Use Electron's dialog to select a font file
          const result = await window.electronAPI.uploadFont();
          if (result && result.path) {
            // Update settings with the new font
            setSettings(prev => ({
              ...prev,
              customFontFamily: `custom-font-${result.name.replace(/\.[^/.]+$/, "")}`,
              customFontPath: result.path
            }));
            
            // Load the font immediately
            try {
              const fontFace = new FontFace(`custom-font-${result.name.replace(/\.[^/.]+$/, "")}`, `url(${result.path})`);
              await fontFace.load();
              document.fonts.add(fontFace);
            } catch (fontError) {
              console.error('Error loading font:', fontError);
            }
          }
        } else {
          // Process uploaded font file
          const fileReader = new FileReader();
          
          const fileDataPromise = new Promise((resolve) => {
            fileReader.onload = () => resolve(fileReader.result);
          });
          
          fileReader.readAsDataURL(file);
          const fileData = await fileDataPromise;
          
          // Save file through Electron and get the local file path
          const fontUrl = await window.electronAPI.saveFile({
            fileData,
            fileName: file.name,
            fileType: 'font'
          });
          
          if (fontUrl) {
            // Create a consistent font family name based on the filename
            const fontName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
            const fontFamily = `custom-font-${fontName}`;
            
            try {
              // Load the font immediately
              const fontFace = new FontFace(fontFamily, `url(${fontUrl})`);
              await fontFace.load();
              document.fonts.add(fontFace);
              
              // Update settings
              setSettings(prev => ({
                ...prev,
                customFontFamily: fontFamily,
                customFontPath: fontUrl
              }));
            } catch (fontError) {
              console.error('Error loading font:', fontError);
            }
          }
        }
      } else {
        // Fallback for web environment
        if (file) {
          const fontUrl = URL.createObjectURL(file);
          const fontFamily = `custom-font-${file.name.replace(/\.[^/.]+$/, "")}`;
          
          try {
            const fontFace = new FontFace(fontFamily, `url(${fontUrl})`);
            await fontFace.load();
            document.fonts.add(fontFace);
            
            setSettings(prev => ({
              ...prev,
              customFontFamily: fontFamily,
              customFontPath: fontUrl
            }));
          } catch (fontError) {
            console.error('Error loading font:', fontError);
          }
        }
      }
    } catch (error) {
      console.error('Error processing font:', error);
    }
  };
  
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
                  拖拽 .json 文件到此处, 或点击选择文件
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
                <div className="flex items-center">
                  <div 
                    className="w-10 h-10 rounded-md mr-2"
                    style={{ backgroundColor: settings.positiveColor }}
                  ></div>
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                    onClick={() => openColorModal('positiveColor', '正方颜色')}
                  >
                    选择颜色
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">反方颜色:</label>
                <div className="flex items-center">
                  <div 
                    className="w-10 h-10 rounded-md mr-2"
                    style={{ backgroundColor: settings.negativeColor }}
                  ></div>
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                    onClick={() => openColorModal('negativeColor', '反方颜色')}
                  >
                    选择颜色
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">自定义字体:</label>
                <div className="flex space-x-2">
                  <input
                    type="file"
                    accept=".woff,.woff2,.ttf,.otf"
                    className="w-57 border rounded p-2"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        handleFontUpload(file);
                      }
                    }}
                  />
                  {window.electronAPI && (
                    <button
                      className="px-4 py-2 bg-blue-500 text-white rounded"
                      onClick={() => handleFontUpload()}
                    >
                      选择文件
                    </button>
                  )}
                </div>
                <div className="mt-4 text-xl" 
                    style={{fontFamily: settings.customFontFamily || 'inherit'}}>
                  预览文字 / Preview Text / 0123456789
                </div>
                {settings.customFontPath && (
                  <div className="mt-2 text-sm text-gray-500">
                    当前字体: {settings.customFontPath.split('/').pop()}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {isAddModalOpen && (
          <AddModal setIsModalOpen={setIsAddModalOpen} setData={setData} />
        )}

        {isColorModalOpen && (
          <ColorModal
            isOpen={isColorModalOpen}
            onClose={() => setIsColorModalOpen(false)}
            onColorSelect={handleColorChange}
            title={colorModalTitle}
            initialColor={currentColorSetting === 'positiveColor' ? settings.positiveColor : settings.negativeColor}
          />
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