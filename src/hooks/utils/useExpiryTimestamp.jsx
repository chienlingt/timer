import { useCallback } from "react";

const useExpiryTimestamp = () => {
  const getExpiryTimestamp = useCallback((duration) => {
    return new Date(Date.now() + duration * 1000); // Assuming duration is in seconds
  }, []);

  return { getExpiryTimestamp };
};

export default useExpiryTimestamp;
