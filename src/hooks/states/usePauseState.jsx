import { useState, useCallback } from "react";

const usePauseState = () => {
  const [isPaused, setIsPaused] = useState(false);

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  return { isPaused, togglePause };
};

export default usePauseState;
