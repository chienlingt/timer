import { library } from '@fortawesome/fontawesome-svg-core';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from "react";
import Screen from "./components/Screen";
import Modal from "./components/rules/Modal";

// Add the cog icon to the library
library.add(faCog);

function App() {
  const config = {
    primaryTimerToggle: "q",
    secondaryTimerToggle: "w",
    restart: "R",
    pause: "P",
    previousSession: ",",
    nextSession: ".",
  };

  // Initial default session
  const defaultSessions = [
    {
      title: "请选择赛制",
      isDualTimer: false,
      duration: 1,
    }
  ];

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
    positiveColor: '#23C1FF', // Tailwind blue-500
    negativeColor: '#AEF359', // Tailwind lime-500
    fontStyle: 'font-sans', // Default font style
    customFontFamily: '',
    customFontPath: ''
  };

  // Load sessions from localStorage or use default
  const [sessions, setSessions] = useState(() => {
    const savedSessions = localStorage.getItem('debateTimerSessions');
    return savedSessions ? JSON.parse(savedSessions) : defaultSessions;
  });

  // Load settings from localStorage or use default
  const [settings, setSettings] = useState(() => {
    // First try to load from localStorage
    const savedSettings = localStorage.getItem('debateTimerSettings');
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
    
    // Fallback to default settings
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
          // Check if the font file exists (in Electron environment)
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

  // Save sessions to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('debateTimerSessions', JSON.stringify(sessions));
  }, [sessions]);

  // Save current session index to localStorage
  useEffect(() => {
    localStorage.setItem('debateTimerCurrentIndex', currentSessionIndex.toString());
  }, [currentSessionIndex]);

  // Save settings to localStorage
  

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
      // Check if electronAPI is available (running in Electron)
      if (window.electronAPI) {
        try {
          // First try to get any resolved settings directly
          const resolvedSettings = await window.electronAPI.getResolvedSettings();
          
          // Then get the actual files
          const files = await window.electronAPI.getStoredFiles();
          
          if (files && files.length > 0) {
            const updatedSettings = { ...settings };
            let settingsChanged = false;
            
            // Use resolved settings first if available
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
            
            // If resolved settings didn't work, fall back to scanning files
            if (!settingsChanged) {
              // Look for background files
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
            
            // Handle font loading specifically
            const fontFiles = files.filter(file => file.name.includes('font-'));
            if (fontFiles.length > 0) {
              // Sort by timestamp (newer first) if we have multiple fonts
              fontFiles.sort((a, b) => {
                const timestampA = parseInt(a.name.split('-')[1]);
                const timestampB = parseInt(b.name.split('-')[1]);
                return timestampB - timestampA;
              });
              
              // Use the newest font
              const newestFont = fontFiles[0];
              
              if (!settings.customFontPath || !settings.customFontPath.includes(newestFont.name)) {
                updatedSettings.customFontPath = newestFont.path;
                
                // Extract the original font name
                const parts = newestFont.name.split('-');
                parts.shift(); // Remove "font-" prefix
                parts.shift(); // Remove timestamp
                const fontName = parts.join('-').replace(/\.[^/.]+$/, ""); // Remove extension
                
                updatedSettings.customFontFamily = `custom-font-${fontName}`;
                settingsChanged = true;
                
                // Load the font immediately
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
            
            // Only update settings if something changed
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
  }, []); // Empty dependency array ensures this runs only once at app startup

  // Customize keyboard shortcut for special sessions
  useEffect(() => {
    const handleSpecialSessionToggle = (sessionKey) => {
      if (specialSessionContext) {
        if (specialSessionContext.key === sessionKey) {
          // Same key pressed → go back to original sessions
          setSessions(specialSessionContext.allSessions);
          setCurrentSessionIndex(specialSessionContext.index);
          setSpecialSessionContext(null);
        } else {
          // ✅ Different special session key → just switch directly
          setSessions([specialSessions[sessionKey]]);
          setCurrentSessionIndex(0);
          setSpecialSessionContext({
            ...specialSessionContext,
            key: sessionKey
          });
        }
      } else {
        // First time entering special session → store current context
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
        // If you're in special session, revert back to original sessions
        if (specialSessionContext) {
          setSessions(specialSessionContext.allSessions);
          setCurrentSessionIndex(specialSessionContext.index);
          setSpecialSessionContext(null);
          setKey((prevKey) => prevKey + 1);
        } else {
          // Otherwise, navigate normally
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
  
  // Disable previous/next session when in a special session
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
          label1: session.label1 || "正方",
          label2: session.label2 || "反方"
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
          // Reset special session context when sessions change
          setSpecialSessionContext(null);
        }}
        settings={settings}
        setSettings={setSettings}
      />
    </div>
  );
}

export default App;