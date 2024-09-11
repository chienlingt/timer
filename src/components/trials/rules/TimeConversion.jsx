export const convertTimeToSeconds = (timeUnit, customTime, timeValue) => {
  if (timeUnit === "分钟和秒") {
    return (
      parseInt(customTime.customMinutes, 10) * 60 +
      parseInt(customTime.customSeconds, 10)
    );
  } else if (timeUnit === "常见") {
    const timeMap = {
      "2分钟": 120,
      "2分钟30秒": 150,
      "3分钟": 180,
      "4分钟": 240,
    };
    return timeMap[timeValue];
  } else if (timeUnit === "分钟") {
    return timeValue * 60;
  }
  return timeValue;
};

export const formatSecondsToMinutesAndSeconds = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes} 分钟 ${String(remainingSeconds).padStart(2, "0")} 秒`;
};
