import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from "prop-types";
import { useState } from "react";
import { useTimers } from "../hooks/useTimers";
import useKeyboardShortcut from "../hooks/utils/useKeyboardShortcut";
import Timer from "./Timer";
import PauseModal from "./modals/PauseModal";

function Screen({ config, session, onPreviousSession, onNextSession, setIsModalOpen, settings }) {
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

  // Get title style for non-dual timers
  const getTitleStyle = () => {
    if (session.isDualTimer) return { color: "white" };
    
    if (session.title.includes("正")) {
      return { color: settings.positiveColor };
    }
    if (session.title.includes("反")) {
      return { color: settings.negativeColor };
    }
    return { color: "white" };
  };

  // Render title with colored parts for dual timers
  const renderTitle = () => {
    if (!session.isDualTimer) {
      return session.title;
    }

    // For dual timer sessions, colorize the specific terms
    return (
      <>
        {session.title.split(/(正方|反方)/).map((part, index) => {
          if (part === "正方") {
            return (
              <span key={index} style={{ color: settings.positiveColor }}>
                {part}
              </span>
            );
          } else if (part === "反方") {
            return (
              <span key={index} style={{ color: settings.negativeColor }}>
                {part}
              </span>
            );
          }
          return part;
        })}
      </>
    );
  };

  return (
    <div
      className={`w-screen h-screen flex flex-col justify-center bg-cover bg-center ${settings.fontStyle}`}
      style={{
        backgroundImage:
          session.title === "封面" ? `url("${settings.coverBackground}")` : `url("${settings.defaultBackground}")`,
      }}
    >
      <div className="absolute top-4 right-4">
        <button onClick={() => setIsModalOpen(true)}>
          <FontAwesomeIcon icon="cog" className="text-gray-400 hover:text-gray-800 transition-colors text-3xl" />
        </button>
      </div>
  
      {session.title !== "封面" && (
        <>
          <div className="text-center mb-6">
            <h1
              className="text-[1.5rem] md:text-[2rem] lg:text-[3rem] xl:text-[3rem] font-bold"
              style={getTitleStyle()}
            >
              {renderTitle()}
            </h1>
          </div>
  
          <div className="flex justify-center">
            <Timer
              key="Primary"
              minutes={primaryMinutes}
              seconds={primarySeconds}
              label={session.isDualTimer ? session.label1 : ""}
              isActive={
                session.isDualTimer
                  ? isPrimaryRunning && !isSecondaryRunning
                  : isPrimaryRunning
              }
              idleStyle="text-slate-400"
              activeStyle={session.title.includes("反") ? settings.negativeColor : settings.positiveColor}
              settings={settings}
              labelStyle={session.isDualTimer ? { color: settings.positiveColor } : {}}
            />
            {session.isDualTimer && (
              <Timer
                key="Secondary"
                minutes={secondaryMinutes}
                seconds={secondarySeconds}
                label={session.label2}
                isActive={!isPrimaryRunning && isSecondaryRunning}
                idleStyle="text-slate-400"
                activeStyle={settings.negativeColor}
                settings={settings}
                labelStyle={{ color: settings.negativeColor }}
              />
            )}
          </div>
        </>
      )}
  
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
  settings: PropTypes.object.isRequired,
};

export default Screen;