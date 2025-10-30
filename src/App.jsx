import { library } from '@fortawesome/fontawesome-svg-core';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from "react";
import defaultSessionsData from '../BBK semi final.json'; // Import the JSON file
import Screen from "./components/Screen";
import Modal from "./components/rules/Modal";

// Add the cog icon to the library
library.add(faCog);

function App() {
  const config = {
    primaryTimerToggle: "q",
    secondaryTimerToggle: "w",
    restart: "r",
    pause: "P",
    previousSession: ",",
    nextSession: ".",
  };

  const specialSessions = {
    "1": { 
      title: "教练指导", 
      duration: 60, 
      isDualTimer: false 
    },
    "2": { 
      title: "教练指导", 
      duration: 120, 
      isDualTimer: false 
    }
  };

  // Default settings
  const defaultSettings = {
    coverBackground: 'src/assets/计时器封面画面-02.png',
    defaultBackground: 'src/assets/计时器待机画面-02.png',
    positiveColor: '#23C1FF',
    negativeColor: '#AEF359',
    fontStyle: 'font-sans',
    customFontFamily: '',
    customFontPath: ''
  };

  // Load sessions from the imported JSON file (not localStorage)
  const [sessions, setSessions] = useState(defaultSessionsData);

  // Load settings from localStorage or use default
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('debateTimerSettings');
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
    return defaultSettings;
  });

  useEffect(() => {
    const loadSettings = async () => {
      if (window.electronAPI) {
        try {
          const electronSettings = await window.electronAPI.loadAppSettings();
          if (electronSettings) {
            setSettings(prev => ({
              ...prev,
              ...electronSettings
            }));
          }
        } catch (error) {
          console.error('Error loading settings from Electron:', error);
        }
      }
    };
    
    loadSettings();
  }, []);

  // Save settings to both localStorage and Electron store
  useEffect(() => {
    localStorage.setItem('debateTimerSettings', JSON.stringify(settings));
    
    if (window.electronAPI) {
      window.electronAPI.saveAppSettings(settings).catch(error => {
        console.error('Error saving settings to Electron:', error);
      });
    }
  }, [settings]);

  // Enhanced font loading
  useEffect(() => {
    const loadFont = async () => {
      if (settings.customFontFamily && settings.customFontPath) {
        try {
          if (window.electronAPI && settings.customFontPath.startsWith('file://')) {
            const exists = await window.electronAPI.checkFileExists(
              settings.customFontPath.replace('file://', '')
            );
            if (!exists) return;
          }
          
          const fontFace = new FontFace(
            settings.customFontFamily,
            `url(${settings.customFontPath})`
          );
          
          await fontFace.load();
          document.fonts.add(fontFace);
          setFontsLoaded(true);
        } catch (err) {
          console.error('Failed to load font:', err);
        }
      }
    };
    
    loadFont();
  }, [settings.customFontFamily, settings.customFontPath]);

  const [currentSessionIndex, setCurrentSessionIndex] = useState(() => {
    const savedIndex = localStorage.getItem('debateTimerCurrentIndex');
    return savedIndex ? parseInt(savedIndex, 10) : 0;
  });
  
  const [key, setKey] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [specialSessionContext, setSpecialSessionContext] = useState(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Save current session index to localStorage
  useEffect(() => {
    localStorage.setItem('debateTimerCurrentIndex', currentSessionIndex.toString());
  }, [currentSessionIndex]);

  // Load custom font if available
  useEffect(() => {
    if (settings.customFontFamily && settings.customFontPath && !fontsLoaded) {
      const fontFace = new FontFace(settings.customFontFamily, `url(${settings.customFontPath})`);
      fontFace.load().then(() => {
        document.fonts.add(fontFace);
        setFontsLoaded(true);
      }).catch(err => {
        console.error('Failed to load font:', err);
      });
    }
  }, [settings.customFontFamily, settings.customFontPath, fontsLoaded]);

  // Load stored files when app starts
  useEffect(() => {
    const loadStoredFiles = async () => {
      if (window.electronAPI) {
        try {
          const resolvedSettings = await window.electronAPI.getResolvedSettings();
          const files = await window.electronAPI.getStoredFiles();
          
          if (files && files.length > 0) {
            const updatedSettings = { ...settings };
            let settingsChanged = false;
            
            if (resolvedSettings.coverBackground) {
              updatedSettings.coverBackground = resolvedSettings.coverBackground;
              settingsChanged = true;
            }
            
            if (resolvedSettings.defaultBackground) {
              updatedSettings.defaultBackground = resolvedSettings.defaultBackground;
              settingsChanged = true;
            }
            
            if (resolvedSettings.customFontPath) {
              updatedSettings.customFontPath = resolvedSettings.customFontPath;
              settingsChanged = true;
            }
            
            if (!settingsChanged) {
              const coverBgFile = files.find(file => file.name.includes('coverBackground'));
              if (coverBgFile && (!settings.coverBackground || !settings.coverBackground.includes(coverBgFile.name))) {
                updatedSettings.coverBackground = coverBgFile.path;
                settingsChanged = true;
              }
              
              const defaultBgFile = files.find(file => file.name.includes('defaultBackground'));
              if (defaultBgFile && (!settings.defaultBackground || !settings.defaultBackground.includes(defaultBgFile.name))) {
                updatedSettings.defaultBackground = defaultBgFile.path;
                settingsChanged = true;
              }
            }
            
            const fontFiles = files.filter(file => file.name.includes('font-'));
            if (fontFiles.length > 0) {
              fontFiles.sort((a, b) => {
                const timestampA = parseInt(a.name.split('-')[1]);
                const timestampB = parseInt(b.name.split('-')[1]);
                return timestampB - timestampA;
              });
              
              const newestFont = fontFiles[0];
              
              if (!settings.customFontPath || !settings.customFontPath.includes(newestFont.name)) {
                updatedSettings.customFontPath = newestFont.path;
                
                const parts = newestFont.name.split('-');
                parts.shift();
                parts.shift();
                const fontName = parts.join('-').replace(/\.[^/.]+$/, "");
                
                updatedSettings.customFontFamily = `custom-font-${fontName}`;
                settingsChanged = true;
                
                try {
                  const fontFace = new FontFace(updatedSettings.customFontFamily, `url(${newestFont.path})`);
                  await fontFace.load();
                  document.fonts.add(fontFace);
                  setFontsLoaded(true);
                } catch (err) {
                  console.error('Failed to load font:', err);
                }
              }
            }
            
            if (settingsChanged) {
              setSettings(updatedSettings);
            }
          }
        } catch (error) {
          console.error('Error loading stored files:', error);
        }
      }
    };
    
    loadStoredFiles();
  }, []);

  // Customize keyboard shortcut for special sessions
  useEffect(() => {
    const handleSpecialSessionToggle = (sessionKey) => {
      if (specialSessionContext) {
        if (specialSessionContext.key === sessionKey) {
          setSessions(defaultSessionsData); // Reset to default sessions
          setCurrentSessionIndex(specialSessionContext.index);
          setSpecialSessionContext(null);
        } else {
          setSessions([specialSessions[sessionKey]]);
          setCurrentSessionIndex(0);
          setSpecialSessionContext({
            ...specialSessionContext,
            key: sessionKey
          });
        }
      } else {
        setSpecialSessionContext({
          allSessions: sessions,
          index: currentSessionIndex,
          key: sessionKey
        });
        setSessions([specialSessions[sessionKey]]);
        setCurrentSessionIndex(0);
      }
      setKey((prevKey) => prevKey + 1);
    };

    const handleKeyDown = (event) => {
      if (event.key === "1") {
        handleSpecialSessionToggle("1");
      } else if (event.key === "2") {
        handleSpecialSessionToggle("2");
      } else if (event.key === config.previousSession || event.key === config.nextSession) {
        if (specialSessionContext) {
          setSessions(defaultSessionsData); // Reset to default sessions
          setCurrentSessionIndex(specialSessionContext.index);
          setSpecialSessionContext(null);
          setKey((prevKey) => prevKey + 1);
        } else {
          if (event.key === config.previousSession) {
            handlePreviousSession();
          } else {
            handleNextSession();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [specialSessionContext, sessions, currentSessionIndex]);
  
  const handlePreviousSession = () => {
    if (!specialSessionContext && sessions.length > 1) {
      setCurrentSessionIndex((prevIndex) =>
        prevIndex === 0 ? sessions.length - 1 : prevIndex - 1
      );
      setKey((prevKey) => prevKey + 1);
    }
  };

  const handleNextSession = () => {
    if (!specialSessionContext && sessions.length > 1) {
      setCurrentSessionIndex((prevIndex) =>
        (prevIndex + 1) % sessions.length
      );
      setKey((prevKey) => prevKey + 1);
    }
  };

  const session = sessions[currentSessionIndex];

  return (
    <div>
      <Screen 
        key={key}
        config={config}
        session={{
          ...session,
          label1: session.label1 || "",
          label2: session.label2 || ""
        }}
        onPreviousSession={handlePreviousSession}
        onNextSession={handleNextSession}
        setIsModalOpen={setIsModalOpen}
        settings={settings}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        setSessions={(newSessions) => {
          setSessions(newSessions);
          setSpecialSessionContext(null);
        }}
        settings={settings}
        setSettings={setSettings}
      />
    </div>
  );
}

export default App;