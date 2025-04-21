# P4M1: Ollama Chatbot Server Example  

Example ``Node.js`` + ``Express`` server that provides a simple web interface for interacting with [Ollama](https://ollama.com/), a local AI model runner. It exposes several endpoints to chat with different models, manage chat history, and retrieve available models from a running Ollama server instance.


## 📦 Prerequisites

- [Node.js](https://nodejs.org/) installed
- [Ollama](https://ollama.com/download) installed and running locally at `http://127.0.0.1:11434`
- Ensure that the required models are pulled using:
  ```bash
  ollama pull <model-name>
  ```  
  You can find available model names [here](https://ollama.com/search)


## 🚀 How to Run

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the server:

   ```bash
   npm start
   ```

3. Open in your browser:

   ```
   http://localhost:3000
   ```

> Make sure Ollama is running locally at `http://127.0.0.1:11434` and the necessary model is pulled.



## 🔌 API Endpoints

### `GET /`
Serves the main HTML page from `public/index.html`.


### `GET /models`
Fetches and returns a list of available models from the local Ollama server.

**Example response:**
```json
{
  "message": "The available models are: llama2, mistral, codellama"
}
```


### `GET /user/:model/:msg`
Sends a message to the specified model and returns a response using Ollama’s chat API.  
Maintains a session history in memory for contextual conversation.

**Params:**
- `:model` – The model name (e.g., `llama2`)
- `:msg` – The user message to send

**Example:**
```
/user/llama2/What is the capital of France?
```


### `GET /history`
Returns the current conversation history in JSON format.


### `GET /clear`
Clears the in-memory conversation history.

## 📁 File Structure

```
project-root/
├── public/
│   ├── index.html       # Main HTML page served at the root endpoint (/)
│   ├── main.css         # Stylesheet for the front-end interface
│   └── main.js          # Client-side JavaScript for interacting with the API
├── index.mjs            # Entry point for the Express server
└── package.json         # Project metadata and dependencies
```

## ⚠️ Notes

- If the Ollama server is not running or the requested model is unavailable, most endpoints will return a `500` error with a descriptive message.
- This server is intended **for local/testing use only**.  
  Do **not** expose it to the public without proper:
    - Authentication
    - Input validation
    - Security measures (e.g., rate limiting, sanitization, etc.)

## Related Links

- [Ollama Documentation](https://ollama.com/)
