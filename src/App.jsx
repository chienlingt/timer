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
    pause: "p",
    previousSession: ",",
    nextSession: ".",
  };

  const [sessions, setSessions] = useState([
    {
      title: "请选择赛制",
      isDualTimer: false,
      duration: 1,
    }
  ]);

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

  const [currentSessionIndex, setCurrentSessionIndex] = useState(0);
  const [key, setKey] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [specialSessionContext, setSpecialSessionContext] = useState(null);

  // Customize keyboard shortcut for special sessions
  useEffect(() => {
    const handleSpecialSessionToggle = (sessionKey) => {
      // If currently in a special session, prevent switching to another special session
      if (specialSessionContext) {
        // If trying to switch to a different special session, do nothing
        if (specialSessionContext.key !== sessionKey) {
          return;
        }
        
        // If same key is pressed, restore previous context
        setSessions(specialSessionContext.allSessions);
        setCurrentSessionIndex(specialSessionContext.index);
        setSpecialSessionContext(null);
      } else {
        // Store current session context before switching
        setSpecialSessionContext({
          allSessions: sessions,
          index: currentSessionIndex,
          key: sessionKey
        });
        
        // Switch to the specific special session
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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [specialSessionContext, sessions, currentSessionIndex]);
  
  const [settings, setSettings] = useState({
    coverBackground: 'src/assets/计时器封面画面-02.png',
    defaultBackground: 'src/assets/计时器待机画面-02.png',
    positiveColor: 'rgb(59, 130, 246)', // Tailwind blue-500
    negativeColor: 'rgb(132, 204, 22)', // Tailwind lime-500
    fontStyle: 'font-sans', // Default font style
  });
  
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