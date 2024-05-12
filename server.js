const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const app = express();

app.use(bodyParser.json());

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

mongoose.connect('mongodb://localhost:27017/Backend', );
// Define user schema and model
const userSchema = new mongoose.Schema({
    username: String,
    passwordHash: String,
});

const User = mongoose.model('User', userSchema);

app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({ username, passwordHash: hashedPassword });

    // Save the user to the database
    try {
        await user.save();
        res.status(201).json({ success: true, message: 'User registered successfully' });
    } catch (err) {
        console.error('Error saving user:', err);
        res.status(500).json({ success: false, message: 'Error registering user' });
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Find the user in the database
    const user = await User.findOne({ username });

    if (!user) {
        return res.status(400).json({ success: false, message: 'User not found' });
    }

    // Check the password
    const match = await bcrypt.compare(password, user.passwordHash);

    if (!match) {
        return res.status(400).json({ success: false, message: 'Invalid password' });
    }

    // User is authenticated
    res.status(200).json({ success: true, message: 'User authenticated successfully' });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});