import { useCallback, useEffect, useState } from "react";
import useTimerState from "./states/useTimerState";

export const useTimers = (session) => {
  const primaryDuration = Number(
    session?.isDualTimer && (session.primaryDuration ?? session.duration) !== undefined
      ? (session.primaryDuration ?? session.duration)
      : (session.duration ?? 0)
  );

  const secondaryDuration = Number(
    session?.isDualTimer && (session.secondaryDuration ?? session.duration) !== undefined
      ? (session.secondaryDuration ?? session.duration)
      : (session.duration ?? 0)
  );

  const primaryTimer = useTimerState(primaryDuration);
  const secondaryTimer = useTimerState(secondaryDuration);

  const [primaryExpired, setPrimaryExpired] = useState(false);
  const [isGlowing, setIsGlowing] = useState(false);

  // Debug
  useEffect(() => {
    console.log("useTimers durations:", { primaryDuration, secondaryDuration, session });
  }, [primaryDuration, secondaryDuration, session]);

  // Auto-stop both when primary hits 0 (dual only)
useEffect(() => {
  if (!session?.isDualTimer) return;

  const primaryTimeLeft =
    primaryTimer.minutes * 60 * 1000 +
    primaryTimer.seconds * 1000 +
    (primaryTimer.milliseconds ?? 0);

  // Consider it expired if <= 10ms (to catch near-zero cases)
  const primaryIsZero = primaryTimeLeft <= 10;

  if (primaryIsZero && !primaryExpired) {
    // Only trigger once
    primaryTimer.pause?.();
    secondaryTimer.pause?.();
    setPrimaryExpired(true);
  }
}, [
  primaryTimer.minutes,
  primaryTimer.seconds,
  primaryTimer.milliseconds,
  primaryExpired,
  session?.isDualTimer,
  primaryTimer.pause,
  secondaryTimer.pause,
]);

  // Glow when BOTH are running (dual only)
  const isBothRunning = session?.isDualTimer
    ? primaryTimer.isRunning && secondaryTimer.isRunning
    : false;

  useEffect(() => {
    setIsGlowing(session?.isDualTimer ? isBothRunning : false);
  }, [isBothRunning, session?.isDualTimer]);

  // NEW: Q-key – start/stop BOTH (dual only)
  const toggleBoth = useCallback(() => {
  if (!session?.isDualTimer || primaryExpired) return;

  const bothRunning = primaryTimer.isRunning && secondaryTimer.isRunning;
  const bothStopped = !primaryTimer.isRunning && !secondaryTimer.isRunning;

  if (bothRunning || !bothStopped) {
    // If both running → pause both
    // If one running → pause both (sync)
    primaryTimer.pause?.();
    secondaryTimer.pause?.();
  } else if (bothStopped) {
    // BOTH STOPPED → START BOTH
    // Prefer `start()` if never started, otherwise `resume()`
    // Fall back to `toggleRunning()` if needed
    const startOrResume = (timer) => {
      if (timer.start) return timer.start();
      if (timer.resume) return timer.resume();
      if (timer.toggleRunning) return timer.toggleRunning();
    };

    startOrResume(primaryTimer);
    startOrResume(secondaryTimer);
  }
}, [
  session?.isDualTimer,
  primaryExpired,
  primaryTimer,
  secondaryTimer,
]);

  const togglePrimaryTimer = useCallback(() => {
    if (primaryTimer.toggleRunning) return primaryTimer.toggleRunning();
    if (primaryTimer.isRunning) return primaryTimer.pause?.();
    return primaryTimer.start ? primaryTimer.start() : primaryTimer.resume?.();
  }, [primaryTimer]);

  const toggleSecondaryTimer = useCallback(() => {
    if (secondaryTimer.toggleRunning) return secondaryTimer.toggleRunning();
    if (secondaryTimer.isRunning) return secondaryTimer.pause?.();
    return secondaryTimer.start ? secondaryTimer.start() : secondaryTimer.resume?.();
  }, [secondaryTimer]);

  const pauseTimers = useCallback(() => {
    primaryTimer.pause?.();
    secondaryTimer.pause?.();
  }, [primaryTimer, secondaryTimer]);

  const restartTimers = useCallback(() => {
    primaryTimer.restart?.();
    secondaryTimer.restart?.();
    setPrimaryExpired(false);
  }, [primaryTimer, secondaryTimer]);

  const restartPrimary = useCallback(() => {
    primaryTimer.restart?.();
    setPrimaryExpired(false);
  }, [primaryTimer]);

  return {
    primaryMinutes: primaryTimer.minutes,
    primarySeconds: primaryTimer.seconds,
    primaryMilliseconds: primaryTimer.milliseconds,
    secondaryMinutes: secondaryTimer.minutes,
    secondarySeconds: secondaryTimer.seconds,
    secondaryMilliseconds: secondaryTimer.milliseconds,
    isPrimaryRunning: primaryTimer.isRunning,
    isSecondaryRunning: secondaryTimer.isRunning,
    primaryExpired,
    isBothRunning,
    isGlowing,
    toggleBoth,                     // NEW
    togglePrimaryTimer,
    toggleSecondaryTimer,
    restartTimers,
    restartPrimary,
    pauseTimers,
  };
};

export default useTimers;