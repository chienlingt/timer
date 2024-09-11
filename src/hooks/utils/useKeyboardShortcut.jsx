import { useEffect } from "react";

const useKeyboardShortcut = (key, callback) => {
  useEffect(() => {
    const handleKeydown = (event) => {
      if (event.key === key) {
        callback();
      }
    };

    window.addEventListener("keydown", handleKeydown);

    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [key, callback]);
};

export default useKeyboardShortcut;
