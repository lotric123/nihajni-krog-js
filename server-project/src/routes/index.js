import express from 'express';

const router = express.Router();

// Define your routes here
router.get('/', (req, res) => {
    res.send('Welcome to the server!');
});

// Add more routes as needed
router.get('/about', (req, res) => {
    res.send('About this server project.');
});

export default router;