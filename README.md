AI Chat Assistant
A local AI-powered chat assistant built with Next.js and React, utilizing the Ollama API for text generation. This project enables users to select AI models, adjust response creativity with a temperature setting, and generate text from prompts with real-time streaming via Server-Sent Events (SSE).

Table of Contents:

1. Features
2. Tech Stack
3. Getting Started
4. Prerequisites
5. Installation
6. Usage
7. Project Structure
8. API Routes

9. Features

Model Selection: Choose from a list of AI models retrieved from the Ollama API.
Temperature Control: Adjust response creativity using a temperature range of 0.1 to 2.0.
Real-time Streaming: View generated text as it streams in real-time with SSE.
Responsive Design: Styled with Tailwind CSS for a modern, user-friendly interface.
Keyboard Shortcut: Press Enter in the prompt textarea to trigger text generation.

2. Tech Stack

Frontend: Next.js, React, TypeScript
Styling: Tailwind CSS
Backend: Next.js API Routes
AI Integration: Ollama API
Streaming: Server-Sent Events (SSE)

3. Getting Started

4. Prerequisites

Before you begin, ensure you have the following installed:

Node.js: Version 14 or later.
Ollama: A local Ollama server running on http://localhost:11434.

Install Ollama and run ollama pull "model" - i'm using mistral and llama2
Run ollama serve to start a server at http://localhost:11434 if one is not running already after install.

5. Installation
   Clone the Repository:
   bash

git clone https://github.com/MocanuAndrei31/rag-chat
cd rag-chat

After cloning -> npm install

After installing -> npm run dev

6. Usage

Select a Model:
Use the dropdown menu to choose an AI model from the list fetched from the Ollama API.
Adjust Temperature:
Modify the temperature (0.1 to 2.0) using the input field to control the randomness of the generated text.
Enter a Prompt:
Type your question or prompt into the textarea. Press Enter or click "Generate" to proceed.
Generate Text:
Click the "Generate" button or press Enter to start the text generation process.
View Output:
Watch the response stream in real-time in the output section below the input fields.

7. Project Structure
   Here’s an overview of the project’s file structure based on the provided code:

app/page.tsx -> The main page containing the chat interface logic and UI
app/api/generate/route.ts: Handles the initial text generation request (POST /api/generate).
app/api/models/route.ts: Fetches available models from Ollama (GET /api/models).
app/api/generate/stream.ts: Streams the generated text using SSE (GET /api/generate/stream).
public/: Static assets (e.g., favicon).

8. API Routes
   The project uses Next.js API routes to communicate with the Ollama server:

GET /api/models:
Fetches the list of available models from http://localhost:11434/api/tags.
Returns: JSON object with an array of model names.
POST /api/generate:
Validates the request body (prompt, model, temperature) and initiates generation.
Request Body: { prompt: string, model: string, temperature: number }.
Returns: JSON confirmation or error message.
GET /api/generate/stream:
Streams generated text using SSE based on query parameters.
Query Params: prompt, model, temperature, timestamp.
Returns: Real-time text chunks or error messages.
