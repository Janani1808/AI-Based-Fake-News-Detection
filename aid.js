const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// Load model and tokenizer
let model;
let wordIndex;

async function loadModelAndTokenizer() {
  try {
    model = await tf.loadLayersModel('file://backend/model/model.json');
    console.log("Model loaded successfully.");

    const tokenizerData = fs.readFileSync('backend/model/tokenizer.json');
    wordIndex = JSON.parse(tokenizerData);
    console.log("Tokenizer loaded successfully.");
  } catch (err) {
    console.error("Failed to load model or tokenizer:", err);
  }
}

// Preprocess input text
function preprocess(text) {
  const maxLen = 100; // adjust based on what your model expects

  const sequence = text
    .toLowerCase()
    .split(/\W+/)
    .map(word => wordIndex[word] || 0);

  // Pad or truncate to fixed length
  const padded = new Array(maxLen).fill(0);
  for (let i = 0; i < Math.min(sequence.length, maxLen); i++) {
    padded[i] = sequence[i];
  }

  const input = tf.tensor2d([padded], [1, maxLen]);
  return input;
}

// Prediction endpoint
app.post('/predict', async (req, res) => {
  const text = req.body.text;

  if (!text) {
    return res.status(400).json({ error: 'No text provided' });
  }

  try {
    const input = preprocess(text);
    const prediction = model.predict(input);
    const predictionData = await prediction.data();
    const result = predictionData[0] > 0.5 ? 'Fake' : 'Real';

    res.json({ prediction: result, confidence: predictionData[0] });
  } catch (err) {
    console.error("Prediction error:", err);
    res.status(500).json({ error: 'Model prediction failed' });
  }
});

// Start server after loading model/tokenizer
loadModelAndTokenizer().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
});
