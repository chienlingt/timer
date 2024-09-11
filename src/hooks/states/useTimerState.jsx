import { useCallback } from "react";
import { useTimer } from "react-timer-hook";

const useTimerState = (durationInSeconds) => {
  // Convert the duration to minutes and seconds
  const initialMinutes = Math.floor(durationInSeconds / 60);
  const initialSeconds = durationInSeconds % 60;

  const {
    seconds,
    minutes,
    isRunning,
    start,
    pause,
    resume,
    restart: restartTimer,
  } = useTimer({
    expiryTimestamp: new Date(Date.now() + durationInSeconds * 1000),
    autoStart: false,
  });

  const toggleRunning = useCallback(() => {
    if (isRunning) {
      pause();
    } else {
      resume(); // Use resume if you need to continue from paused state
    }
  }, [isRunning, pause, resume]);

  const restart = useCallback(() => {
    restartTimer(new Date(Date.now() + durationInSeconds * 1000), false);
  }, [durationInSeconds, restartTimer]);

  return {
    isRunning,
    seconds: seconds === 0 && minutes === 0 ? initialSeconds : seconds,
    minutes: minutes === 0 ? initialMinutes : minutes,
    toggleRunning,
    pause,
    restart,
  };
};

export default useTimerState;
