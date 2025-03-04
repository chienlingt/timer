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

  // Fix: Check if timer is at or has passed expiry
  const currentSeconds = minutes * 60 + seconds;
  const hasTimeLeft = currentSeconds > 0;
  
  const displayMinutes = hasTimeLeft ? minutes : 0;
  const displaySeconds = hasTimeLeft ? seconds : 0;

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
    seconds: displaySeconds,
    minutes: displayMinutes,
    toggleRunning,
    pause,
    restart,
  };
};

export default useTimerState;