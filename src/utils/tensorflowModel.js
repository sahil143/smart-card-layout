import * as tf from '@tensorflow/tfjs';
import localforage from 'localforage';

// Training data - simulated interaction patterns
const TRAINING_DATA = [
  // Format: [clickCount, hoverTime] -> priority (0-3 where 0 is highest priority)
  [[0, 0], [3]], // No interaction -> lowest priority
  [[1, 2], [2]], // Low interaction -> medium-low priority
  [[3, 5], [1]], // Medium interaction -> medium-high priority
  [[5, 10], [0]], // High interaction -> highest priority
  [[2, 1], [2]], // Quick clicks -> medium-low priority
  [[1, 8], [1]], // Long hover -> medium-high priority
  [[10, 15], [0]], // Very high interaction -> highest priority
  [[0, 1], [3]], // Only brief hover -> lowest priority
  [[4, 3], [1]], // Good clicks, short hover -> medium-high priority
  [[2, 7], [1]], // Medium clicks, good hover -> medium-high priority
  [[6, 2], [0]], // Many clicks -> highest priority
  [[1, 1], [2]], // Minimal interaction -> medium-low priority
];

class SmartCardModel {
  constructor() {
    this.model = null;
    this.isModelReady = false;
    this.modelKey = 'smart-card-model';
  }

  async initializeModel() {
    console.log('🚀 INITIALIZING AI MODEL SYSTEM');
    
    try {
      // Try to load existing model
      console.log('🔍 Checking for existing saved model...');
      const savedModel = await localforage.getItem(this.modelKey);
      
      if (savedModel) {
        console.log('📦 Found saved model, attempting to load...');
        try {
          this.model = await tf.loadLayersModel(tf.io.fromMemory(savedModel));
          this.isModelReady = true;
          console.log('✅ Saved model loaded successfully!');
          console.log('🎯 Model ready for predictions');
          return;
        } catch (loadError) {
          console.warn('⚠️ Failed to load saved model, creating new one:', loadError);
          // Clear corrupted saved model
          await localforage.removeItem(this.modelKey);
          console.log('🗑️ Removed corrupted saved model');
        }
      } else {
        console.log('📝 No saved model found');
      }

      console.log('🆕 Creating and training new model...');
      await this.createAndTrainModel();
    } catch (error) {
      console.error('❌ Error initializing model:', error);
      // Set model as ready even if training fails, use fallback predictions
      this.isModelReady = true;
      console.log('🔄 Model system ready with fallback predictions');
    }
  }

  async createAndTrainModel() {
    console.log('🤖 STARTING AI MODEL CREATION');
    console.log('📊 Training Data:', TRAINING_DATA);
    
    // Create a simple neural network
    console.log('🏗️ Building Neural Network:');
    console.log('   - Input Layer: 2 features (clicks, hover time)');
    console.log('   - Hidden Layer 1: 8 neurons (ReLU)');
    console.log('   - Hidden Layer 2: 4 neurons (ReLU)');
    console.log('   - Output Layer: 4 neurons (Softmax - priority levels)');
    
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [2], // clickCount, hoverTime
          units: 8,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 4,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 4, // 4 priority levels (0-3)
          activation: 'softmax'
        })
      ]
    });

    // Compile the model
    console.log('⚙️ Compiling model with Adam optimizer and sparse categorical crossentropy loss');
    this.model.compile({
      optimizer: tf.train.adam(0.01),
      loss: 'sparseCategoricalCrossentropy',
      metrics: ['accuracy']
    });

    // Prepare training data
    const inputs = TRAINING_DATA.map(([input]) => input);
    const outputs = TRAINING_DATA.map(([, output]) => output[0]);
    
    console.log('📋 Preparing Training Data:');
    console.log('   - Input features (clicks, hover):', inputs);
    console.log('   - Output labels (priority 0-3):', outputs);

    // Create tensors with proper dtypes
    const xs = tf.tensor2d(inputs, undefined, 'float32');
    const ys = tf.tensor1d(outputs, undefined, 'int32');
    
    console.log('🔢 Created tensors:');
    console.log('   - Input tensor shape:', xs.shape, 'dtype:', xs.dtype);
    console.log('   - Output tensor shape:', ys.shape, 'dtype:', ys.dtype);

    try {
      // Train the model
      console.log('🎓 STARTING MODEL TRAINING (50 epochs)...');
      const startTime = Date.now();
      
      const history = await this.model.fit(xs, ys, {
        epochs: 50,
        validationSplit: 0.2,
        shuffle: true,
        verbose: 0,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            if (epoch % 10 === 0 || epoch === 49) {
              console.log(`   Epoch ${epoch + 1}/50 - Loss: ${logs.loss.toFixed(4)}, Accuracy: ${logs.acc.toFixed(4)}, Val Loss: ${logs.val_loss.toFixed(4)}, Val Acc: ${logs.val_acc.toFixed(4)}`);
            }
          }
        }
      });

      const trainingTime = Date.now() - startTime;
      console.log(`✅ MODEL TRAINING COMPLETED in ${trainingTime}ms`);
      console.log('📈 Final Training Metrics:');
      console.log('   - Final Loss:', history.history.loss[history.history.loss.length - 1].toFixed(4));
      console.log('   - Final Accuracy:', history.history.acc[history.history.acc.length - 1].toFixed(4));
      console.log('   - Final Val Loss:', history.history.val_loss[history.history.val_loss.length - 1].toFixed(4));
      console.log('   - Final Val Accuracy:', history.history.val_acc[history.history.val_acc.length - 1].toFixed(4));

      // Save the model
      await this.saveModel();
      this.isModelReady = true;
      console.log('💾 Model saved successfully and ready for predictions!');
    } catch (error) {
      console.error('❌ Training failed:', error);
      // Use a simpler fallback approach
      this.isModelReady = true;
      console.log('🔄 Fallback mode enabled - will use simple scoring algorithm');
    } finally {
      // Clean up tensors
      xs.dispose();
      ys.dispose();
      console.log('🧹 Training tensors cleaned up');
    }
  }

  async saveModel() {
    if (!this.model) {
      console.warn('No model to save');
      return;
    }
    
    try {
      const modelData = await this.model.save(tf.io.withSaveHandler(async (artifacts) => {
        return {
          modelTopology: artifacts.modelTopology,
          weightSpecs: artifacts.weightSpecs,
          weightData: artifacts.weightData
        };
      }));
      
      await localforage.setItem(this.modelKey, modelData);
      console.log('Model saved successfully');
    } catch (error) {
      console.error('Error saving model:', error);
    }
  }

  // Method to reset the model if there are issues
  async resetModel() {
    try {
      await localforage.removeItem(this.modelKey);
      this.model = null;
      this.isModelReady = false;
      console.log('Model reset, will retrain on next initialization');
    } catch (error) {
      console.error('Error resetting model:', error);
    }
  }

  async predictCardOrder(interactionData) {
    console.log('🔮 STARTING CARD ORDER PREDICTION');
    console.log('📊 Input Interaction Data:', interactionData);
    
    if (!this.isModelReady || !this.model) {
      console.warn('⚠️ Model not ready, using fallback ordering');
      const fallbackOrder = this.getFallbackOrder(interactionData);
      console.log('🔄 Fallback Order Result:', fallbackOrder);
      return fallbackOrder;
    }

    try {
      // Normalize interaction data
      const normalizedData = this.normalizeInteractionData(interactionData);
      console.log('📏 Normalized Data for AI Model:', normalizedData);
      
      // Create tensor for prediction with explicit float32 dtype
      const inputs = tf.tensor2d(normalizedData, undefined, 'float32');
      console.log('🔢 Prediction Input Tensor:', {
        shape: inputs.shape,
        dtype: inputs.dtype,
        data: await inputs.data()
      });
      
      // Make predictions
      console.log('🎯 Running AI Model Prediction...');
      const predictions = this.model.predict(inputs);
      const probabilities = await predictions.data();
      
      console.log('🧠 Raw AI Model Output (Probabilities):');
      console.log('   - Raw probabilities array:', Array.from(probabilities));
      
      // Log probabilities for each card
      const cardNames = ['Todo List', 'Weather', 'Calendar', 'Notes'];
      for (let i = 0; i < interactionData.length; i++) {
        const cardProbs = Array.from(probabilities).slice(i * 4, (i + 1) * 4);
        console.log(`   - ${cardNames[i]} priorities: [P0:${cardProbs[0].toFixed(3)}, P1:${cardProbs[1].toFixed(3)}, P2:${cardProbs[2].toFixed(3)}, P3:${cardProbs[3].toFixed(3)}]`);
      }
      
      // Convert probabilities to card order
      const cardOrder = this.probabilitiesToOrder(probabilities, interactionData.length);
      
      console.log('🎯 AI PREDICTION RESULTS:');
      console.log('   - Predicted Card Order:', cardOrder);
      console.log('   - Card Priority Ranking:');
      cardOrder.forEach((cardIndex, position) => {
        console.log(`      ${position + 1}. ${cardNames[cardIndex]} (Original Index: ${cardIndex})`);
      });
      
      // Clean up tensors
      inputs.dispose();
      predictions.dispose();
      console.log('🧹 Prediction tensors cleaned up');
      
      return cardOrder;
    } catch (error) {
      console.error('❌ Error making prediction:', error);
      const fallbackOrder = this.getFallbackOrder(interactionData);
      console.log('🔄 Using fallback order due to error:', fallbackOrder);
      return fallbackOrder;
    }
  }

  normalizeInteractionData(interactionData) {
    // Find max values for normalization
    const maxClicks = Math.max(...interactionData.map(d => d.clicks), 1);
    const maxHoverTime = Math.max(...interactionData.map(d => d.hoverTime), 1);
    
    return interactionData.map(({ clicks, hoverTime }) => [
      clicks / maxClicks,
      hoverTime / maxHoverTime
    ]);
  }

  probabilitiesToOrder(probabilities, numCards) {
    const cardScores = [];
    
    // Process probabilities for each card
    for (let i = 0; i < numCards; i++) {
      const cardProbs = probabilities.slice(i * 4, (i + 1) * 4);
      // Calculate weighted score (lower priority number = higher importance)
      const score = cardProbs[0] * 3 + cardProbs[1] * 2 + cardProbs[2] * 1 + cardProbs[3] * 0;
      cardScores.push({ index: i, score });
    }
    
    // Sort by score (highest first) and return indices
    return cardScores
      .sort((a, b) => b.score - a.score)
      .map(card => card.index);
  }

  getFallbackOrder(interactionData) {
    console.log('🔄 USING FALLBACK ORDERING ALGORITHM');
    console.log('📊 Input data for fallback:', interactionData);
    
    // Fallback: sort by total interaction (clicks + normalized hover time)
    const scores = interactionData.map(({ clicks, hoverTime }, index) => ({
      index,
      score: clicks + (hoverTime / 1000) // Convert hover time to seconds
    }));
    
    console.log('📈 Calculated interaction scores:');
    const cardNames = ['Todo List', 'Weather', 'Calendar', 'Notes'];
    scores.forEach(({ index, score }, position) => {
      console.log(`   - ${cardNames[index]}: ${score.toFixed(2)} points (${interactionData[index].clicks} clicks + ${(interactionData[index].hoverTime/1000).toFixed(2)}s hover)`);
    });
    
    const order = scores
      .sort((a, b) => b.score - a.score)
      .map(card => card.index);

    console.log('🎯 FALLBACK ORDER RESULT:');
    order.forEach((cardIndex, position) => {
      console.log(`   ${position + 1}. ${cardNames[cardIndex]} (Score: ${scores.find(s => s.index === cardIndex).score.toFixed(2)})`);
    });
    
    return order;
  }

  getExplanation(interactionData, cardOrder) {
    console.log('💬 GENERATING AI EXPLANATION');
    console.log('📊 Interaction data for explanation:', interactionData);
    console.log('🎯 Card order for explanation:', cardOrder);
    
    if (!interactionData || interactionData.length === 0) {
      const explanation = "Cards arranged in default order";
      console.log('📝 Generated explanation:', explanation);
      return explanation;
    }

    const sortedData = cardOrder.map(index => ({
      ...interactionData[index],
      originalIndex: index
    }));

    const topCard = sortedData[0];
    const cardNames = [ 'Weather', 'Calendar', 'Notes', 'Todo List'];
    
    console.log('🥇 Top card analysis:', {
      name: cardNames[topCard.originalIndex],
      clicks: topCard.clicks,
      hoverTime: topCard.hoverTime,
      hoverSeconds: Math.round(topCard.hoverTime / 1000)
    });
    
    let explanation;
    if (topCard.clicks > 0 || topCard.hoverTime > 1000) {
      const action = topCard.clicks > topCard.hoverTime / 1000 ? 
        `clicked ${topCard.clicks} times` : 
        `browsed for ${Math.round(topCard.hoverTime / 1000)}s`;
      
      explanation = `${cardNames[topCard.originalIndex]} is first - you ${action} last session`;
    } else {
      explanation = "Cards arranged based on your usage patterns";
    }
    
    console.log('📝 Generated explanation:', explanation);
    return explanation;
  }
}

// Export singleton instance
export const smartCardModel = new SmartCardModel(); 