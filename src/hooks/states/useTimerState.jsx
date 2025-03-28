import { useCallback, useEffect, useRef, useState } from "react";
import { useTimer } from "react-timer-hook";

const useTimerState = (durationInSeconds) => {
  const [pausedTime, setPausedTime] = useState(null);
  const [remainingTime, setRemainingTime] = useState(durationInSeconds * 1000 + 990);
  const [milliseconds, setMilliseconds] = useState(990);
  const animationFrameRef = useRef(null);

  const {
    seconds,
    minutes,
    isRunning,
    start,
    pause,
    resume,
    restart: restartTimer,
  } = useTimer({
    expiryTimestamp: new Date(Date.now() + durationInSeconds * 1000 + 990),
    autoStart: false,
  });

  // Precise milliseconds and remaining time tracking
  useEffect(() => {
    let startTime;
    let lastTime;

    const updateMilliseconds = (timestamp) => {
      if (!startTime) startTime = timestamp;
      
      if (!lastTime) lastTime = startTime;
      const elapsed = timestamp - lastTime;
      lastTime = timestamp;

      // Update remaining time
      setRemainingTime(prevTime => Math.max(0, prevTime - elapsed));

      // Update milliseconds
      setMilliseconds(prevMs => {
        let newMs = prevMs - 10;
        if (newMs < 0) {
          newMs = 990;
        }
        return newMs;
      });

      // Continue animation if timer is running and has time left
      if (isRunning && remainingTime > 0) {
        animationFrameRef.current = requestAnimationFrame(updateMilliseconds);
      }
    };

    // Start tracking when running
    if (isRunning) {
      animationFrameRef.current = requestAnimationFrame(updateMilliseconds);
    }

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning]);

  // Calculate display values
  const currentSeconds = Math.floor(remainingTime / 1000);
  const displayMinutes = Math.floor(currentSeconds / 60);
  const displaySeconds = currentSeconds % 60;

  const toggleRunning = useCallback(() => {
    if (isRunning) {
      // When pausing, save the precise pause time
      const currentTime = Date.now();
      setPausedTime(currentTime);
      pause();
    } else {
      if (pausedTime) {
        // Recalculate remaining time precisely
        const newRemainingTime = Math.max(0, remainingTime);
        
        // Restart timer with precise remaining time
        const newExpiryTimestamp = new Date(Date.now() + newRemainingTime);
        restartTimer(newExpiryTimestamp, false);
        setPausedTime(null);
      } else {
        // If not previously paused, just resume
        resume();
      }
    }
  }, [isRunning, pause, resume, pausedTime, remainingTime, restartTimer]);

  const restart = useCallback(() => {
    setPausedTime(null);
    setMilliseconds(990);
    setRemainingTime(durationInSeconds * 1000 + 990);
    restartTimer(new Date(Date.now() + durationInSeconds * 1000 + 990), false);
  }, [durationInSeconds, restartTimer]);

  return {
    isRunning,
    seconds: displaySeconds,
    minutes: displayMinutes,
    milliseconds,
    toggleRunning,
    pause,
    restart,
    pausedTime,
  };
};

export default useTimerState;