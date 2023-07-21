// server.js
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');

const app = express();

// Set storage for multer, specify file storage path and filename
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
})

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // in bytes
    }
});

mongoose.connect('mongodb://localhost:27017/mydb', { useNewUrlParser: true, useUnifiedTopology: true });

const Schema = mongoose.Schema;

const dataSchema = new Schema({
    userId: String,
    fengyin: [String],
    fengyin_n: Number,
    dianbiao: [String],
    timestamp: Date,
    files: [String],  // Only save the urls to files
});

const Data = mongoose.model('Data', dataSchema);

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'https://www.xihelin.com:15711', 'https://www.xihelin.com:15712'],
    credentials: true
}));

// Use multer as a middleware
app.post('/submit', upload.array('files'), async (req, res) => {
    const { userId, fengyin, fengyin_n, dianbiao } = req.body;
    const timestamp = new Date();

    // Save the url to file instead of the file itself
    const files = req.files.map(file => `https://www.xihelin.com:15789/uploads/${file.filename}`);

    const data = new Data({ userId, fengyin, fengyin_n, dianbiao, timestamp, files });

    try {
        await data.save();
        res.send({ success: true });
    } catch (err) {
        console.error(err);
        res.send({ success: false });
    }
});

// Serve the static files
app.use('/uploads', express.static('uploads'));

app.listen(8989, () => {
    console.log('Server is running on port 8989');
});

app.get('/data', async (req, res) => {
    try {
        const data = await Data.find();
        res.send(data);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});


// login
const session = require('express-session');
const bcrypt = require('bcrypt');

app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60 * 60 * 24 * 30000 } // 1 day
}));

const userSchema = new Schema({
    username: String,
    password: String,
    name: String,
    is_admin: Boolean
});

const User = mongoose.model('User', userSchema);

app.post('/user/create', async (req, res) => {
    const { username, password, name, is_admin } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ username, password: hashedPassword, name, is_admin });

    try {
        await user.save();
        res.send({ success: true });
    } catch (err) {
        console.error(err);
        res.send({ success: false });
    }
});

app.post('/user/login', async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
        req.session.userId = user._id;
        req.session.isAdmin = user.is_admin;
        res.send({ success: true, isAdmin: user.is_admin, name: user.name });
        //console.log(res);
    } else {
        res.send({ success: false });
    }
});

app.get('/users', async (req, res) => {
//    if (!req.session.userId || !req.session.isAdmin) {
//        return res.status(403).send('Forbidden');
//    }

    const users = await User.find().select('-password'); // Don't send password back
    res.send(users);
});

app.delete('/user/:id', async (req, res) => {
//    if (!req.session.userId || !req.session.isAdmin) {
//        return res.status(403).send('Forbidden');
//    }

    try {
        await User.findByIdAndRemove(req.params.id);
        res.send({ success: true });
    } catch (err) {
        console.error(err);
        res.send({ success: false });
    }
});

app.delete('/data/:id', async (req, res) => {
    try {
        await Data.findByIdAndRemove(req.params.id);
        res.send({ success: true });
    } catch (err) {
        console.error(err);
        res.send({ success: false });
    }
});


app.get('/user/me', async (req, res) => {
//    if (!req.session.userId) {
//        return res.status(403).send('Forbidden');
//    }

    const user = await User.findById(req.session.userId).select('-password'); // Don't send password back
    if (user) {
        res.send(user);
    } else {
        res.send({ success: false });
    }
});
