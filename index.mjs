import { Ollama } from 'ollama'
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP = express();
const PORT = 3000;
const OLLAMA = new Ollama({ host: 'http://127.0.0.1:11434' });

APP.use(express.static(path.join(__dirname, 'public')));
let history = [];

APP.get('/history', (req, res) => {
    res.send(history);
});

APP.get('/clear', (req, res) => {
   history = [];
    res.send('History cleared');
});

APP.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

APP.get('/models', async (req, res) => {
    try {
        // https://ollama.com/library
        let list = await OLLAMA.list();
        list = list.models.filter(m => m.model).map(m => m.model);
        res.send(`The available models are: ${list.join(', ')}`);
    } catch (err) {
        res.status(500).send(`Error: ${err.message}. Possible: OLLAMA server is not running or not reachable.`);
    }
});

APP.get('/user/:model/:msg', async (req, res) => {
    const { model, msg } = req.params;
    history.push({ role: 'user', content: msg });
    try {
        const response = await OLLAMA.chat({
            model: model,
            messages: history,
        });
        history.push({ role: response.message.role, content: response.message.content });
        res.send(response);
    } catch (err) {
        res.status(500).send(`Error: ${err.message}. Possible: OLLAMA server is not running or not reachable.`);
    }
});

APP.listen(PORT, async () => {
    console.log(`Server is listen at http://localhost:${PORT}`);
    const list = await OLLAMA.list();
    console.log(list);
});