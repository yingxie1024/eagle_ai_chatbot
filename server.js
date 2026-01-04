const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// AI Builders API configuration
const AI_BUILDERS_BASE_URL = 'https://space.ai-builders.com/backend';
const AI_BUILDER_TOKEN = process.env.AI_BUILDER_TOKEN;

if (!AI_BUILDER_TOKEN) {
  console.error('Error: AI_BUILDER_TOKEN is not set in environment variables');
  process.exit(1);
}

// Proxy endpoint to get available models
app.get('/api/models', async (req, res) => {
  try {
    const response = await axios.get(`${AI_BUILDERS_BASE_URL}/v1/models`, {
      headers: {
        'Authorization': `Bearer ${AI_BUILDER_TOKEN}`
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching models:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch models',
      details: error.response?.data || error.message
    });
  }
});

// Proxy endpoint for chat completions
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, model, temperature, max_tokens, stream } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const requestBody = {
      model: model || 'supermind-agent-v1',
      messages: messages,
      ...(temperature !== undefined && { temperature }),
      ...(max_tokens !== undefined && { max_tokens }),
      stream: stream || false
    };

    const response = await axios.post(
      `${AI_BUILDERS_BASE_URL}/v1/chat/completions`,
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${AI_BUILDER_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error in chat completion:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to get chat completion',
      details: error.response?.data || error.message
    });
  }
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`AI Builders API configured with base URL: ${AI_BUILDERS_BASE_URL}`);
});

