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
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        setSessions={setSessions} // Pass setSessions to Modal
      />
    </div>
  );
}

export default App;