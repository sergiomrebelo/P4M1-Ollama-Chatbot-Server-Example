import { Ollama } from 'ollama';
import express from 'express';
import cookieSession from 'cookie-session';
const { randomBytes } = await import('node:crypto');


import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP = express();
const PORT = 3000;
const OLLAMA = new Ollama({ host: 'http://127.0.0.1:11434' });

APP.use(express.static(path.join(__dirname, 'public')));

APP.use(cookieSession({
    name: 'session',
    keys: [
        randomBytes(32).toString('hex'),
        randomBytes(32).toString('hex'),
        randomBytes(32).toString('hex')
    ],
    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

let history = [];

APP.get('/history', (req, res) => {
    const clientHistory = history.filter(i => i.client === req.session.clientId);
    res.send(clientHistory);
});

APP.get('/clean', (req, res) => {
    cleanHistory();
    res.send('History cleared');
});

const cleanHistory = () => {
    const filtered = history.filter(i => i.client !== req.session.clientId);
    history = filtered;
}

APP.get(`/sessionId`, (req, res) => {
   res.send(req.session.clientId);
});

APP.get(`/destroy`, (req, res) => {
    console.log (`Session ID: ${req.session.clientId} destroyed`);
    cleanHistory();
    req.session.clientId = null;
    res.send(`Session cleared. Please refresh the page to start a new session.`);
});

// middleware to detect new clients
APP.use((req, res, next) => {
    if (!req.session.clientId) {
        const newClientId = randomBytes(16).toString('hex');
        req.session.clientId = newClientId;
        console.log(`New window/tab detected! Client ID: ${newClientId}`);
    } else {
        console.log(`Returning window/tab detected. Client ID: ${req.session.clientId}`);
    }
    next();
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
    history.push({ role: 'user', content: msg, client: req.session.clientId });
    const clientHistory = history.filter(i => i.client === req.session.clientId);
    try {
        const response = await OLLAMA.chat({
            model: model,
            messages: clientHistory,
        });
        history.push({ role: response.message.role, content: response.message.content, client: req.session.clientId });
        res.send(response);
    } catch (err) {
        res.status(500).send(`Error: ${err.message}. Possible: OLLAMA server is not running or not reachable.`);
    }
});

APP.listen(PORT, async () => {
    console.log(`Server is listen at http://localhost:${PORT}`);
    // const list = await OLLAMA.list();
    //  console.log(list);
});