import { useCallback, useEffect } from "react";
import useTimerState from "./states/useTimerState";

export const useTimers = (session) => {
  const primaryDuration = session.duration;

  // Initialize timers
  const primaryTimer = useTimerState(primaryDuration);
  const secondaryTimer = useTimerState(primaryDuration);

  // Auto-switch when primary timer expires
  useEffect(() => {
    if (
      session.isDualTimer &&
      primaryTimer.minutes === 0 &&
      primaryTimer.seconds === 0 &&
      (secondaryTimer.minutes !== 0 || secondaryTimer.seconds !== 0)
    ) {
      primaryTimer.pause();
      // Instead of restarting, just start the secondary timer
      secondaryTimer.toggleRunning();
    }
  }, [primaryTimer.minutes, primaryTimer.seconds, session.isDualTimer]);

  // Auto-switch when secondary timer expires
  useEffect(() => {
    if (
      session.isDualTimer &&
      secondaryTimer.minutes === 0 &&
      secondaryTimer.seconds === 0 &&
      (primaryTimer.minutes !== 0 || primaryTimer.seconds !== 0)
    ) {
      secondaryTimer.pause();
      // Instead of restarting, just start the primary timer
      primaryTimer.toggleRunning();
    }
  }, [secondaryTimer.minutes, secondaryTimer.seconds, session.isDualTimer]);

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
    primaryMilliseconds: primaryTimer.milliseconds,
    secondaryMinutes: secondaryTimer.minutes,
    secondarySeconds: secondaryTimer.seconds,
    secondaryMilliseconds: secondaryTimer.milliseconds,
    isPrimaryRunning: primaryTimer.isRunning,
    isSecondaryRunning: secondaryTimer.isRunning,
    togglePrimaryTimer,
    toggleSecondaryTimer,
    restartTimers,
    pauseTimers,
  };
};