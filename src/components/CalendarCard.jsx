import React from 'react';
import { Calendar } from 'lucide-react';
import { CALENDAR_EVENTS } from '../utils/mockData';
import { useInteractionTracking } from '../hooks/useInteractionTracking';
import { useEventListener } from '../hooks/useEventListener';

const CalendarCard = ({ showAiBadge, tooltip, cardId, handleInteraction }) => {
  const wrapperRef = React.useRef();
  const interactionProps = useInteractionTracking(cardId, handleInteraction);

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
          <Calendar size={20} />
          Calendar Events
        </h3>
        {showAiBadge && <span className="ai-badge">AI</span>}
      </div>
      <div className="card-content">
        <div className="events-list">
          {CALENDAR_EVENTS.map(event => (
            <div key={event.id} className="event-item">
              <div className="event-time">{event.time} • {event.date}</div>
              <div className="event-title">{event.title}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarCard; 