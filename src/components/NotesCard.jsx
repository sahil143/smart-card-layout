import React, { useState, useEffect } from 'react';
import { FileText, X } from 'lucide-react';
import { useInteractionTracking } from '../hooks/useInteractionTracking';
import { useEventListener } from '../hooks/useEventListener';

const PREFILLED_NOTES = [
  {
    id: 1,
    text: 'Dashboard layout looks great! The AI integration is working smoothly.',
    timestamp: '2:30 PM'
  },
  {
    id: 2,
    text: 'Remember to test the drag-and-drop functionality in manual mode.',
    timestamp: '1:45 PM'
  },
  {
    id: 3,
    text: 'TensorFlow.js model is training successfully. Performance is good.',
    timestamp: '12:15 PM'
  },
  {
    id: 4,
    text: 'Need to add more interaction patterns for better predictions.',
    timestamp: '11:30 AM'
  }
];

const NotesCard = ({ showAiBadge, tooltip, cardId, handleInteraction }) => {
  const [notes, setNotes] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const wrapperRef = React.useRef();

  const interactionProps = useInteractionTracking(cardId, handleInteraction);

  // Load notes from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('dashboard-notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    } else {
      // Use prefilled notes if no saved data
      setNotes(PREFILLED_NOTES);
      localStorage.setItem('dashboard-notes', JSON.stringify(PREFILLED_NOTES));
    }
  }, []);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem('dashboard-notes', JSON.stringify(notes));
    }
  }, [notes]);

  const addNote = () => {
    if (inputValue.trim()) {
      setNotes([...notes, {
        id: Date.now(),
        text: inputValue.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setInputValue('');
      // Track interaction when adding note
      if (interactionProps?.onClick) {
        interactionProps.onClick();
      }
    }
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id));
    // Track interaction when deleting note
    if (interactionProps?.onClick) {
      interactionProps.onClick();
    }
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
          <FileText size={20} />
          Notes
        </h3>
        {showAiBadge && <span className="ai-badge">AI</span>}
      </div>
      <div className="card-content">
        <div className="notes-input">
          <textarea
            placeholder="Write a note..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            rows={3}
          />
          <button onClick={addNote}>Add Note</button>
        </div>
        <div className="notes-list">
          {notes.map(note => (
            <div key={note.id} className="note-item">
              <button
                className="note-delete"
                onClick={() => deleteNote(note.id)}
                title="Delete note"
              >
                <X size={12} />
              </button>
              <div style={{ fontSize: '0.75rem', color: '#92400e', marginBottom: '0.25rem' }}>
                {note.timestamp}
              </div>
              <div>{note.text}</div>
            </div>
          ))}
        </div>
        {notes.length === 0 && (
          <p style={{ color: '#64748b', fontStyle: 'italic', textAlign: 'center', marginTop: '1rem' }}>
            No notes yet. Add one above!
          </p>
        )}
      </div>
    </div>
  );
};

export default NotesCard; 