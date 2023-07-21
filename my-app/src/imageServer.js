// src/imageServer.js
const express = require('express');
const path = require('path');
const cors = require('cors');


const app = express();
const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:3001', 'https://www.xihelin.com:15711', 'https://www.xihelin.com:15712'],
    credentials: true,
};

app.use(cors(corsOptions));

app.use(express.static(path.join(__dirname, 'images')));

app.listen(8990, () => {
    console.log('Image Server is running on port 8990');
});
