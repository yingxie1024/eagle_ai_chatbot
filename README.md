# ChatGPT-like App

A modern ChatGPT-like web application built with Node.js and Express, featuring conversation history and model selection using the AI Builders API.

## Features

- **Two-column layout**: Left sidebar for conversation history, right panel for current chat
- **Model selection**: Choose from available AI models (deepseek, supermind-agent-v1, gemini-2.5-pro, etc.)
- **Conversation history**: All conversations are saved locally and persist across sessions
- **Modern UI**: Clean, dark-themed interface inspired by ChatGPT
- **Real-time chat**: Send messages and receive AI responses in real-time

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create a `.env` file** in the root directory:
   ```
   AI_BUILDER_TOKEN=sk_f274487b_a104ea6534bd9afc36a440984d2506e59c65
   PORT=3000
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to:
   ```
   http://localhost:3000
   ```

## Project Structure

```
.
├── server.js          # Express server with API proxy
├── package.json       # Node.js dependencies
├── .env              # Environment variables (create this)
├── .gitignore        # Git ignore rules
├── public/           # Frontend files
│   ├── index.html    # Main HTML file
│   ├── style.css     # Styling
│   └── app.js        # Frontend JavaScript
└── README.md         # This file
```

## API Endpoints

- `GET /api/models` - Get list of available models
- `POST /api/chat` - Send chat completion request

## Usage

1. Select a model from the dropdown in the top-right corner
2. Type your message in the input box at the bottom
3. Press Enter or click the send button to send your message
4. Click "New Chat" to start a new conversation
5. Click on any conversation in the left sidebar to switch between conversations

## Technologies Used

- **Backend**: Node.js, Express
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **API**: AI Builders API (https://space.ai-builders.com/backend)
- **Storage**: localStorage for conversation persistence

## Notes

- Conversations are stored in your browser's localStorage
- The app requires an active internet connection to communicate with the AI Builders API
- Make sure your `AI_BUILDER_TOKEN` is valid and has access to the API

