import { useEffect, useState } from 'react';

function Clock() {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const tick = () => {
    setCurrentDate(new Date());
  };

  useEffect(() => {
    const timerId = window.setInterval(tick, 1000);
    return () => window.clearInterval(timerId);
  }, []);

  return (
    <time className="clock-time" dateTime={currentDate.toISOString()}>
      {currentDate.toLocaleTimeString()}
    </time>
  );
}

export default Clock;