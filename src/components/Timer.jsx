
function Timer({
  minutes,
  seconds,
  label,
  isActive = false,
  idleStyle = "text-slate-400",
  activeStyle,
}) {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <h1
        className={`text-[1.3rem] md:text-[1.5rem] lg:text-[2rem] xl:text-[2rem] font-bold ${
          !isActive ? idleStyle : activeStyle
        }`}
      >
        {label}
      </h1>
      <h2
        className={`text-[8rem] md:text-[10rem] lg:text-[12rem] xl:text-[12rem] font-bold ${
          !isActive ? idleStyle : activeStyle
        }`}
      >
        {minutes}:{String(seconds).padStart(2, "0")}
      </h2>
    </div>
  );
}


export default Timer;
