import React, { useState } from 'react';
import { Cloud } from 'lucide-react';
import { WEATHER_DATA, WEEKDAYS } from '../utils/mockData';
import { useInteractionTracking } from '../hooks/useInteractionTracking';
import { useEventListener } from '../hooks/useEventListener';

const WeatherCard = ({ showAiBadge, tooltip, cardId, handleInteraction }) => {
  const [selectedDay, setSelectedDay] = useState('monday');
  const weatherInfo = WEATHER_DATA[selectedDay];
  const wrapperRef = React.useRef();

  const interactionProps = useInteractionTracking(cardId, handleInteraction);

  const handleDayChange = (e) => {
    setSelectedDay(e.target.value);
  };

  useEventListener(wrapperRef.current, 'mouseenter', interactionProps.onMouseEnter);
  useEventListener(wrapperRef.current, 'mousemove', interactionProps.onMouseMove);
  useEventListener(wrapperRef.current, 'mouseleave', interactionProps.onMouseLeave);
  useEventListener(wrapperRef.current, 'click', interactionProps.onClick);

  return (
    <div 
      ref={wrapperRef}
      className="card" 
    >
      {tooltip && <div className="tooltip">{tooltip}</div>}
      <div className="card-header">
        <h3 className="card-title">
          <Cloud size={20} />
          Weather
        </h3>
        {showAiBadge && <span className="ai-badge">AI</span>}
      </div>
      <div className="card-content">
        <div className="weather-controls">
          <select
            value={selectedDay}
            onChange={handleDayChange}
          >
            {WEEKDAYS.map(day => (
              <option key={day} value={day}>
                {WEATHER_DATA[day].day}
              </option>
            ))}
          </select>
        </div>
        <div className="weather-info">
          <h3>{weatherInfo.day}</h3>
          <div style={{ fontSize: '3rem', margin: '0.5rem 0' }}>
            {weatherInfo.emoji}
          </div>
          <div className="temp">{weatherInfo.temp}°F</div>
          <div className="desc">{weatherInfo.description}</div>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard; 