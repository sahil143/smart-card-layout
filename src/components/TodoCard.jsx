import React, { useState, useEffect } from 'react';
import { CheckSquare } from 'lucide-react';
import { useEventListener } from '../hooks/useEventListener';
import { useInteractionTracking } from '../hooks/useInteractionTracking';

const PREFILLED_TODOS = [
  { id: 1, text: 'Review project requirements', completed: false },
  { id: 2, text: 'Update dashboard design', completed: true },
  { id: 3, text: 'Test AI model integration', completed: false },
  { id: 4, text: 'Write documentation', completed: false },
  { id: 5, text: 'Deploy to production', completed: false }
];

const TodoCard = ({ showAiBadge, tooltip, cardId, handleInteraction }) => {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const wrapperRef = React.useRef();

  const interactionProps = useInteractionTracking(cardId, handleInteraction);

  // Load todos from localStorage on mount
  useEffect(() => {
    const savedTodos = localStorage.getItem('dashboard-todos');
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    } else {
      // Use prefilled todos if no saved data
      setTodos(PREFILLED_TODOS);
      localStorage.setItem('dashboard-todos', JSON.stringify(PREFILLED_TODOS));
    }
  }, []);

  // Save todos to localStorage whenever todos change
  useEffect(() => {
    if (todos.length > 0) {
      localStorage.setItem('dashboard-todos', JSON.stringify(todos));
    }
  }, [todos]);

  const addTodo = () => {
    if (inputValue.trim()) {
      setTodos([...todos, {
        id: Date.now(),
        text: inputValue.trim(),
        completed: false
      }]);
      setInputValue('');
      // Track interaction when adding todo
      // if (interactionProps?.onClick) {
      //   interactionProps.onClick();
      // }
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
    // Track interaction when toggling todo
    // if (interactionProps?.onClick) {
    //   interactionProps.onClick();
    // }
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
    // Track interaction when deleting todo
    // if (interactionProps?.onClick) {
    //   interactionProps.onClick();
    // }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  useEventListener(wrapperRef.current, 'mouseenter', interactionProps.onMouseEnter);
  useEventListener(wrapperRef.current, 'mousemove', interactionProps.onMouseMove)
  useEventListener(wrapperRef.current, 'mouseleave', interactionProps.onMouseLeave)
  useEventListener(wrapperRef.current, 'click', interactionProps.onClick)

  return (
    <div 
      ref={wrapperRef}
      className="card" 
    >
      {tooltip && <div className="tooltip">{tooltip}</div>}
      <div className="card-header">
        <h3 className="card-title">
          <CheckSquare size={20} />
          Todo List
        </h3>
        {showAiBadge && <span className="ai-badge">AI</span>}
      </div>
      <div className="card-content">
        <div className="todo-input">
          <input
            type="text"
            placeholder="Add a new todo..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button onClick={addTodo}>Add</button>
        </div>
        <ul className="todo-list">
          {todos.map(todo => (
            <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
              />
              <span>{todo.text}</span>
              <button
                className="delete-btn"
                onClick={() => deleteTodo(todo.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
        {todos.length === 0 && (
          <p style={{ color: '#64748b', fontStyle: 'italic', textAlign: 'center', marginTop: '1rem' }}>
            No todos yet. Add one above!
          </p>
        )}
      </div>
    </div>
  );
};

export default TodoCard; 