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
    primaryMilliseconds,
    secondaryMinutes,
    secondarySeconds,
    secondaryMilliseconds,
    isPrimaryRunning,
    isSecondaryRunning,
    primaryExpired,
    isBothRunning,
    isGlowing,
    toggleBoth,                    // NEW
    togglePrimaryTimer,
    toggleSecondaryTimer,
    restartTimers,
    restartPrimary,                // added
    pauseTimers,
  } = useTimers(session);

  // Keyboard shortcuts -- primary key maps to both when dual
  useKeyboardShortcut(config.primaryTimerToggle, session?.isDualTimer ? toggleBoth : togglePrimaryTimer);
  useKeyboardShortcut(config.secondaryTimerToggle, toggleSecondaryTimer);
  useKeyboardShortcut(config.restart, session?.isDualTimer ? restartPrimary : restartTimers);
  useKeyboardShortcut(config.pause, () => {
    pauseTimers();
    setIsPaused(prev => !prev);
  });

  useKeyboardShortcut(config.previousSession, onPreviousSession);
  useKeyboardShortcut(config.nextSession, onNextSession);

  const getTitleStyle = () => {
    if (session.isDualTimer) return { color: "white" };
    if (session.title && session.title.includes("正")) return { color: settings.positiveColor };
    if (session.title && session.title.includes("反")) return { color: settings.negativeColor };
    return { color: "white" };
  };

  const getTimerActiveStyle = (timerLabel) => {
    if (session.isDualTimer) {
      if (timerLabel === session.label1) return settings.positiveColor;
      if (timerLabel === session.label2) return settings.negativeColor;
    }
    if (session.title === "教练指导" || (!session.title?.includes("正") && !session.title?.includes("反"))) {
      return "text-white";
    }
    return session.title?.includes("反") ? settings.negativeColor : settings.positiveColor;
  };

  const renderTitle = () => {
    if (!session.isDualTimer) return session.title;
    return (
      <>
        {session.title.split(/(正方|反方)/).map((part, i) => {
          if (part === "正方") return <span key={i} style={{ color: settings.positiveColor }}>{part}</span>;
          if (part === "反方") return <span key={i} style={{ color: settings.negativeColor }}>{part}</span>;
          return part;
        })}
      </>
    );
  };

  const label1 = session.label1 ?? "";
  const label2 = session.label2 ?? "";

  return (
    <div
      className={`w-screen h-screen flex flex-col justify-center bg-cover bg-center ${settings.fontStyle}`}
      style={{
        backgroundImage: session.title === "封面"
          ? `url("${settings.coverBackground}")`
          : `url("${settings.defaultBackground}")`,
        fontFamily: settings.customFontFamily || 'inherit'
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
            <h1 className="text-[2rem] md:text-[3rem] lg:text-[4rem] xl:text-[5rem] font-bold" style={getTitleStyle()}>
              {renderTitle()}
            </h1>
          </div>

          <div className="flex justify-center gap-12">
            <Timer
              key="Primary"
              minutes={primaryMinutes}
              seconds={primarySeconds}
              milliseconds={primaryMilliseconds}
              label={session.isDualTimer ? label1 : session.title}
              isActive={session.isDualTimer ? (isPrimaryRunning || isBothRunning) : isPrimaryRunning}
              idleStyle="text-slate-400"
              activeStyle={getTimerActiveStyle(session.isDualTimer ? label1 : "")}
              settings={settings}
              labelStyle={session.isDualTimer ? { color: settings.positiveColor } : {}}
              glow={session.isDualTimer && isGlowing}
            />

            {session.isDualTimer && (
              <Timer
                key="Secondary"
                minutes={secondaryMinutes}
                seconds={secondarySeconds}
                milliseconds={secondaryMilliseconds}
                label={label2}
                isActive={session.isDualTimer ? (isSecondaryRunning || isBothRunning) : isSecondaryRunning}
                idleStyle="text-slate-400"
                activeStyle={getTimerActiveStyle(label2)}
                settings={settings}
                labelStyle={{ color: settings.negativeColor }}
                glow={session.isDualTimer && isGlowing}
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
    duration: PropTypes.number,
    primaryDuration: PropTypes.number,
    secondaryDuration: PropTypes.number,
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