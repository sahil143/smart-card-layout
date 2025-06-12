# Smart Dashboard App

A React-based intelligent dashboard that learns from your interactions and rearranges cards using TensorFlow.js machine learning.
This project is built by a human and [cursor](https://www.cursor.com/).

## ✨ Features

### 🃏 Four Interactive Cards
- **✅ Todo List**: Add, delete, and mark todos as complete
- **☁️ Weather Card**: Mock weather data with 7-day forecast dropdown
- **🗓️ Calendar Events**: Static list of upcoming events
- **📝 Notes**: Simple note-taking with timestamps

### 🧠 Smart Mode vs Manual Mode
- **Manual Mode**: Drag-and-drop card reordering via settings dialog
- **Smart Mode**: AI-powered card arrangement based on your interaction patterns

### 🤖 AI-Powered Features
- **Interaction Tracking**: Monitors clicks and hover time on each card
- **TensorFlow.js Integration**: Neural network model predicts optimal card order
- **Visual Feedback**: AI badge and explanatory tooltips in Smart Mode
- **Persistent Learning**: Model and interactions saved locally

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:5173`

## 🎯 How to Use

### Manual Mode (Default)
1. Click the **Settings** button to open the card arrangement dialog
2. Drag and drop cards to reorder them
3. Click **Save Order** to apply changes
4. Cards will animate to their new positions

### Smart Mode
1. Toggle the **Smart Mode** switch in the header
2. The AI model will initialize (shows loading indicator)
3. Cards automatically rearrange based on your past interactions
4. Hover over the first card to see AI explanation tooltip
5. Continue using the dashboard - interactions are tracked automatically

### Interaction Tracking
The app tracks two types of interactions in Smart Mode:
- **Clicks**: Any click on a card or its contents
- **Hover Time**: Active mouse movement over cards (static hovering doesn't count)

## 🧠 How the AI Works

### Training Data
The model is trained on simulated interaction patterns that correlate usage intensity with card priority:
- No interaction → Lowest priority
- Light interaction → Medium-low priority  
- Medium interaction → Medium-high priority
- High interaction → Highest priority

### Neural Network Architecture
- **Input**: 2 features (click count, hover time)
- **Hidden Layers**: 8 → 4 neurons with ReLU activation
- **Output**: 4 priority levels with softmax activation
- **Training**: 100 epochs with 20% validation split

### Model Persistence
- Trained model stored in IndexedDB via localforage
- Interaction data saved in localStorage
- Model retrains if corrupted or missing

## 🎨 Design Features

- **Modern UI**: Clean, minimal design with smooth animations
- **Responsive**: Mobile-friendly grid layout
- **Smooth Transitions**: Framer Motion animations for card reordering
- **Visual Feedback**: AI badges, tooltips, and loading states
- **Accessible**: Keyboard navigation and screen reader friendly

## 🛠️ Technical Stack

- **React 18**: Component-based UI
- **TensorFlow.js**: Client-side machine learning
- **Framer Motion**: Smooth animations and transitions
- **Vite**: Fast development and building
- **LocalForage**: Enhanced localStorage with IndexedDB fallback
- **Lucide React**: Modern icon library

## 📁 Project Structure

```
src/
├── components/
│   ├── TodoCard.jsx          # Todo list functionality
│   ├── WeatherCard.jsx       # Weather display with dropdown
│   ├── CalendarCard.jsx      # Static calendar events
│   ├── NotesCard.jsx         # Note-taking interface
│   └── SettingsModal.jsx     # Drag-and-drop reordering
├── hooks/
│   └── useInteractionTracking.js  # Mouse interaction tracking
├── utils/
│   ├── tensorflowModel.js    # AI model and predictions
│   └── mockData.js           # Sample weather/calendar data
├── App.jsx                   # Main application component
├── main.jsx                  # React entry point
└── index.css                 # Global styles
```

## 🔧 Customization

### Adding New Cards
1. Create a new card component in `src/components/`
2. Add it to the `cardComponents` array in `App.jsx`
3. Update the `cardNames` array in `SettingsModal.jsx`
4. Adjust the model to handle additional cards

### Modifying AI Behavior
- Edit `TRAINING_DATA` in `src/utils/tensorflowModel.js`
- Adjust network architecture in `createAndTrainModel()`
- Customize interaction weighting in `normalizeInteractionData()`

### Styling Changes
- Global styles in `src/index.css`
- Component-specific styles using CSS classes
- Color scheme and spacing easily customizable
