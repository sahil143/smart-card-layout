import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical } from 'lucide-react';

const SettingsModal = ({ isOpen, onClose, cardOrder, onSaveOrder }) => {
  const [tempOrder, setTempOrder] = useState([...cardOrder]);
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  const cardNames = [
    '☁️ Weather',
    '🗓️ Calendar Events',
    '📝 Notes',
    '✅ Todo List'
  ];

  const handleDragStart = (index) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = () => {
    if (dragItem.current !== null && dragOverItem.current !== null) {
      const dragItemIndex = dragItem.current;
      const dragOverItemIndex = dragOverItem.current;

      const newOrder = [...tempOrder];
      const draggedItem = newOrder.splice(dragItemIndex, 1)[0];
      newOrder.splice(dragOverItemIndex, 0, draggedItem);

      setTempOrder(newOrder);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleSave = () => {
    onSaveOrder(tempOrder);
    onClose();
  };

  const handleCancel = () => {
    setTempOrder([...cardOrder]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleCancel}
      >
        <motion.div
          className="modal"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <h2>Arrange Cards</h2>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
            Drag and drop to reorder your dashboard cards
          </p>
          
          <ul className="sortable-list">
            {tempOrder.map((cardIndex, index) => (
              <li
                key={cardIndex}
                className="sortable-item"
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragEnd={handleDragEnd}
                style={{
                  opacity: dragItem.current === index ? 0.5 : 1
                }}
              >
                <GripVertical size={16} color="#9ca3af" />
                <span>{cardNames[cardIndex]}</span>
              </li>
            ))}
          </ul>

          <div className="modal-actions">
            <button
              className="btn-secondary"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={handleSave}
            >
              Save Order
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SettingsModal; 