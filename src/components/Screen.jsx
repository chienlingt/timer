import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from "prop-types";
import { useState } from "react";
import { useTimers } from "../hooks/useTimers";
import useKeyboardShortcut from "../hooks/utils/useKeyboardShortcut";
import Timer from "./Timer";
import PauseModal from "./modals/PauseModal";

function Screen({ config, session, onPreviousSession, onNextSession, setIsModalOpen }) {
  const [isPaused, setIsPaused] = useState(false);

  const {
    primaryMinutes,
    primarySeconds,
    secondaryMinutes,
    secondarySeconds,
    isPrimaryRunning,
    isSecondaryRunning,
    togglePrimaryTimer,
    toggleSecondaryTimer,
    restartTimers,
    pauseTimers,
  } = useTimers(session);

  useKeyboardShortcut(config.primaryTimerToggle, togglePrimaryTimer);
  useKeyboardShortcut(config.secondaryTimerToggle, toggleSecondaryTimer);
  useKeyboardShortcut(config.restart, restartTimers);
  useKeyboardShortcut(config.pause, () => {
    pauseTimers();
    setIsPaused((prev) => !prev);
  });
  useKeyboardShortcut(config.previousSession, onPreviousSession);
  useKeyboardShortcut(config.nextSession, onNextSession);

  const titleColor = session.isDualTimer
    ? "text-blue-900"
    : session.title.includes("正")
    ? "text-blue-500"
    : session.title.includes("反")
    ? "text-red-500"
    : "text-gray-800";

  const timerIdleColor = "text-slate-400";

  const timerActiveColor = session.title.includes("正")
    ? "text-blue-500"
    : session.title.includes("反")
    ? "text-red-500"
    : "text-gray-800";

  return (
    <div className="w-screen h-screen flex flex-col justify-center">
      <div className="absolute top-4 right-4">
        <button onClick={() => setIsModalOpen(true)}>
          <FontAwesomeIcon icon="cog" className="text-gray-50 hover:text-gray-800 transition-colors text-3xl" />
        </button>
      </div>

      <div className="text-center mb-6">
        <h1 className={`text-[1.5rem] md:text-[2rem] lg:text-[3rem] xl:text-[3rem] font-bold ${titleColor}`}>
          {session.title}
        </h1>
      </div>

      <div className="flex justify-center">
        <Timer
          key="Primary"
          minutes={primaryMinutes}
          seconds={primarySeconds}
          label={session.isDualTimer ? session.label1 : ""}
          isActive={session.isDualTimer ? isPrimaryRunning && !isSecondaryRunning : isPrimaryRunning}
          idleStyle={session.isDualTimer ? "text-slate-400" : timerIdleColor}
          activeStyle={session.isDualTimer ? "text-blue-500" : timerActiveColor}
        />
        {session.isDualTimer && (
          <Timer
            key="Secondary"
            minutes={secondaryMinutes}
            seconds={secondarySeconds}
            label={session.label2}
            isActive={!isPrimaryRunning && isSecondaryRunning}
            idleStyle="text-slate-400"
            activeStyle="text-red-500"
          />
        )}
      </div>

      {isPaused && <PauseModal isOpen={isPaused} onClose={pauseTimers} />}
    </div>
  );
}

Screen.propTypes = {
  config: PropTypes.shape({
    primaryTimerToggle: PropTypes.string.isRequired,
    secondaryTimerToggle: PropTypes.string.isRequired,
    restart: PropTypes.string.isRequired,
    pause: PropTypes.string.isRequired,
    previousSession: PropTypes.string.isRequired,
    nextSession: PropTypes.string.isRequired,
  }).isRequired,
  session: PropTypes.shape({
    isDualTimer: PropTypes.bool.isRequired,
    duration: PropTypes.number.isRequired,
    label1: PropTypes.string,
    label2: PropTypes.string,
    title: PropTypes.string.isRequired,
  }).isRequired,
  onPreviousSession: PropTypes.func.isRequired,
  onNextSession: PropTypes.func.isRequired,
  setIsModalOpen: PropTypes.func.isRequired,
};

export default Screen;
