import { useCallback } from "react";
import useTimerState from "./states/useTimerState";

export const useTimers = (session) => {
  const primaryDuration = session.duration;

  // Calculate expiry timestamps based on duration
  const primaryTimer = useTimerState(primaryDuration);
  const secondaryTimer = useTimerState(primaryDuration);

  const togglePrimaryTimer = useCallback(() => {
    if (!primaryTimer.isRunning) {
      secondaryTimer.pause();
    }
    primaryTimer.toggleRunning();
  }, [primaryTimer, secondaryTimer]);

  const toggleSecondaryTimer = useCallback(() => {
    if (!secondaryTimer.isRunning) {
      primaryTimer.pause();
    }
    secondaryTimer.toggleRunning();
  }, [primaryTimer, secondaryTimer]);

  const pauseTimers = useCallback(() => {
    primaryTimer.pause();
    secondaryTimer.pause();
  }, [primaryTimer, secondaryTimer]);

  const restartTimers = useCallback(() => {
    primaryTimer.restart();
    secondaryTimer.restart();
  }, [primaryTimer, secondaryTimer]);

  return {
    primaryMinutes: primaryTimer.minutes,
    primarySeconds: primaryTimer.seconds,
    secondaryMinutes: secondaryTimer.minutes,
    secondarySeconds: secondaryTimer.seconds,
    isPrimaryRunning: primaryTimer.isRunning,
    isSecondaryRunning: secondaryTimer.isRunning,
    togglePrimaryTimer,
    toggleSecondaryTimer,
    restartTimers,
    pauseTimers,
  };
};
