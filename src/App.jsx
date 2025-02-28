import { library } from '@fortawesome/fontawesome-svg-core';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { useState } from "react";
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
    },
  ]);

  // Use Tailwind compatible RGB values instead of hex codes
  const [settings, setSettings] = useState({
    coverBackground: 'src/assets/计时器封面画面-02.png',
    defaultBackground: 'src/assets/计时器待机画面-02.png',
    positiveColor: 'rgb(59, 130, 246)', // Tailwind blue-500
    negativeColor: 'rgb(132, 204, 22)', // Tailwind lime-500
    fontStyle: 'font-sans', // Default font style
  });
  
  const [currentSessionIndex, setCurrentSessionIndex] = useState(0);
  const [key, setKey] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePreviousSession = () => {
    setCurrentSessionIndex((prevIndex) =>
      prevIndex === 0 ? sessions.length - 1 : prevIndex - 1
    );
    setKey((prevKey) => prevKey + 1);
  };

  const handleNextSession = () => {
    setCurrentSessionIndex((prevIndex) =>
      (prevIndex + 1) % sessions.length
    );
    setKey((prevKey) => prevKey + 1);
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
        setSessions={setSessions} 
        settings={settings}
        setSettings={setSettings}
      />
    </div>
  );
}

export default App;