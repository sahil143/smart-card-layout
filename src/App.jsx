import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Settings, Brain, User } from 'lucide-react';

import TodoCard from './components/TodoCard';
import WeatherCard from './components/WeatherCard';
import CalendarCard from './components/CalendarCard';
import NotesCard from './components/NotesCard';
import SettingsModal from './components/SettingsModal';

import { useInteractionTracking } from './hooks/useInteractionTracking';
import { smartCardModel } from './utils/tensorflowModel';

const STORAGE_KEYS = {
  MODE: 'dashboard-mode',
  CARD_ORDER: 'dashboard-card-order',
  INTERACTIONS: 'dashboard-interactions'
};

function App() {
  const [isSmartMode, setIsSmartMode] = useState(false);
  const [cardOrder, setCardOrder] = useState([0, 1, 2, 3]); // Default order
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [interactions, setInteractions] = useState([
    { clicks: 0, hoverTime: 0 },
    { clicks: 0, hoverTime: 0 },
    { clicks: 0, hoverTime: 0 },
    { clicks: 0, hoverTime: 0 }
  ]);
  const [aiExplanation, setAiExplanation] = useState('');
  const [isModelReady, setIsModelReady] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadStoredData = async () => {
      console.log('🚀 DASHBOARD INITIALIZATION STARTED');
      
      try {
        // Load mode
        console.log('📋 Loading stored application mode...');
        const storedMode = localStorage.getItem(STORAGE_KEYS.MODE);
        if (storedMode) {
          console.log(`📌 Found stored mode: ${storedMode}`);
          setIsSmartMode(storedMode === 'smart');
        } else {
          console.log('📝 No stored mode found, using default: manual');
        }

        // Load interactions
        console.log('📊 Loading stored interaction data...');
        const storedInteractions = localStorage.getItem(STORAGE_KEYS.INTERACTIONS);
        if (storedInteractions) {
          const interactionData = JSON.parse(storedInteractions);
          console.log('📈 Found stored interactions:', interactionData);
          setInteractions(interactionData);
        } else {
          console.log('📝 No stored interactions found, using defaults');
        }

        // Initialize TensorFlow model
        console.log('🤖 Initializing AI model system...');
        await smartCardModel.initializeModel();
        setIsModelReady(true);
        console.log('✅ AI model system ready');

        // If in smart mode, reorder cards based on interactions
        if (storedMode === 'smart') {
          console.log('🧠 App starting in Smart Mode - applying AI predictions');
          const interactionData = storedInteractions 
            ? JSON.parse(storedInteractions)
            : interactions;
          
          const predictedOrder = await smartCardModel.predictCardOrder(interactionData);
          console.log('🎯 Initial AI prediction result:', predictedOrder);
          setCardOrder(predictedOrder);
          
          const explanation = smartCardModel.getExplanation(interactionData, predictedOrder);
          setAiExplanation(explanation);
          console.log('📝 AI explanation set:', explanation);
        } else {
          console.log('👤 App starting in Manual Mode - loading manual order');
          // Load manual card order
          const storedOrder = localStorage.getItem(STORAGE_KEYS.CARD_ORDER);
          if (storedOrder) {
            const manualOrder = JSON.parse(storedOrder);
            console.log('📁 Found saved manual order:', manualOrder);
            setCardOrder(manualOrder);
          } else {
            console.log('🔢 No saved manual order, using default: [0, 1, 2, 3]');
          }
        }
        
        console.log('✅ DASHBOARD INITIALIZATION COMPLETED');
      } catch (error) {
        console.error('❌ Error loading stored data:', error);
      }
    };

    loadStoredData();
  }, []);

  // Handle interaction tracking
  const handleInteraction = useCallback((cardId, type, value) => {
    console.log(`📊 INTERACTION TRACKED: Card ${cardId} - ${type} - ${value}`);
    
    setInteractions(prev => {
      const newInteractions = [...prev];
      if (type === 'click') {
        newInteractions[cardId].clicks += value;
        console.log(`🖱️ Click recorded for card ${cardId}. New count: ${newInteractions[cardId].clicks}`);
      } else if (type === 'hover') {
        newInteractions[cardId].hoverTime += value;
        console.log(`⏱️ Hover time added for card ${cardId}: +${value}ms. Total: ${newInteractions[cardId].hoverTime}ms`);
      }
      
      // Save to localStorage
      localStorage.setItem(STORAGE_KEYS.INTERACTIONS, JSON.stringify(newInteractions));
      console.log('💾 Interactions saved to localStorage:', newInteractions);
      
      return newInteractions;
    });
  }, []);

  // Toggle mode
  const toggleMode = async () => {
    const newMode = !isSmartMode;
    console.log(`🔄 MODE SWITCH: ${isSmartMode ? 'Smart' : 'Manual'} → ${newMode ? 'Smart' : 'Manual'}`);
    
    setIsSmartMode(newMode);
    localStorage.setItem(STORAGE_KEYS.MODE, newMode ? 'smart' : 'manual');

    if (newMode && isModelReady) {
      console.log('🤖 Switching to Smart Mode - AI will predict card order');
      console.log('📊 Current interactions:', interactions);
      
      // Switch to smart mode - reorder cards based on interactions
      const predictedOrder = await smartCardModel.predictCardOrder(interactions);
      console.log('🎯 Setting new card order based on AI prediction:', predictedOrder);
      setCardOrder(predictedOrder);
      
      const explanation = smartCardModel.getExplanation(interactions, predictedOrder);
      setAiExplanation(explanation);
      
      console.log('✅ Smart Mode activated with AI-predicted order');
    } else {
      console.log('👤 Switching to Manual Mode - using saved manual order');
      
      // Switch to manual mode - load stored manual order or use default
      const storedOrder = localStorage.getItem(STORAGE_KEYS.CARD_ORDER);
      if (storedOrder) {
        const manualOrder = JSON.parse(storedOrder);
        console.log('📁 Loading saved manual order:', manualOrder);
        setCardOrder(manualOrder);
      } else {
        console.log('🔢 Using default order: [0, 1, 2, 3]');
      }
      setAiExplanation('');
      
      console.log('✅ Manual Mode activated');
    }
  };

  // Save manual card order
  const handleSaveOrder = (newOrder) => {
    setCardOrder(newOrder);
    if (!isSmartMode) {
      localStorage.setItem(STORAGE_KEYS.CARD_ORDER, JSON.stringify(newOrder));
    }
  };

  // Create card components array
  const cardComponents = [
    WeatherCard,
    CalendarCard,
    NotesCard,
    TodoCard,
  ];

  // Get interaction props for each card
  const getCardProps = (cardId) => {
    
    return {
      showAiBadge: isSmartMode,
      tooltip: isSmartMode && cardId === cardOrder[0] ? aiExplanation : null
    };
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Smart Dashboard</h1>
        <div className="mode-controls">
          <button
            className={`mode-toggle ${isSmartMode ? 'smart' : ''}`}
            onClick={toggleMode}
            disabled={!isModelReady}
          >
            {isSmartMode ? <Brain size={16} /> : <User size={16} />}
            {isSmartMode ? 'Smart Mode' : 'Manual Mode'}
          </button>
          <button
            className="settings-btn"
            onClick={() => setIsSettingsOpen(true)}
            disabled={isSmartMode}
          >
            <Settings size={16} />
            Settings
          </button>
          {/* Debug button */}
          <button
            className="settings-btn"
            onClick={() => {
              console.log('🔍 CURRENT INTERACTIONS STATE:', interactions);
              console.log('🔍 CURRENT CARD ORDER:', cardOrder);
              console.log('🔍 IS SMART MODE:', isSmartMode);
              console.log('🔍 IS MODEL READY:', isModelReady);
            }}
            style={{ background: '#f59e0b', marginLeft: '0.5rem' }}
          >
            Debug
          </button>
        </div>
      </header>

      <motion.div
        className="dashboard"
        layout
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        {cardOrder.map((cardIndex, position) => {
          const CardComponent = cardComponents[cardIndex];
          const cardProps = getCardProps(cardIndex);
          return (
            <motion.div
              key={cardIndex}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.5,
                delay: position * 0.1,
                layout: { duration: 0.6, ease: "easeInOut" }
              }}
            >
              <CardComponent {...cardProps} cardId={cardIndex} handleInteraction={handleInteraction} />
            </motion.div>
          );
        })}
      </motion.div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        cardOrder={cardOrder}
        onSaveOrder={handleSaveOrder}
      />

      {!isModelReady && (
        <div style={{
          position: 'fixed',
          bottom: '1rem',
          right: '1rem',
          background: '#3b82f6',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '0.5rem',
          fontSize: '0.875rem'
        }}>
          Loading AI model...
        </div>
      )}
    </div>
  );
}

export default App; 