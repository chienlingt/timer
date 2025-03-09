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
    positiveColor: 'rgb(59, 130, 246)', // Tailwind blue-500
    negativeColor: 'rgb(132, 204, 22)', // Tailwind lime-500
    fontStyle: 'font-sans', // Default font style
    customFontFamily: ''
  };

  // Load sessions from localStorage or use default
  const [sessions, setSessions] = useState(() => {
    const savedSessions = localStorage.getItem('debateTimerSessions');
    return savedSessions ? JSON.parse(savedSessions) : defaultSessions;
  });

  // Load settings from localStorage or use default
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('debateTimerSettings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  const [currentSessionIndex, setCurrentSessionIndex] = useState(() => {
    const savedIndex = localStorage.getItem('debateTimerCurrentIndex');
    return savedIndex ? parseInt(savedIndex, 10) : 0;
  });
  
  const [key, setKey] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [specialSessionContext, setSpecialSessionContext] = useState(null);

  // Save sessions to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('debateTimerSessions', JSON.stringify(sessions));
  }, [sessions]);

  // Save current session index to localStorage
  useEffect(() => {
    localStorage.setItem('debateTimerCurrentIndex', currentSessionIndex.toString());
  }, [currentSessionIndex]);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('debateTimerSettings', JSON.stringify(settings));
  }, [settings]);

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