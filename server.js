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

const reportSchema = new mongoose.Schema({
    event_name: String,
    event_type: String,
    date_of_event: String,
    aud_count: Number,
    from_time: String,
    to_time: String,
    venue: String
});

const Report = mongoose.model('Report', reportSchema);

const User = mongoose.model('User', userSchema);


// signup endpoint
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

//event report endpoint
app.post('/report', async(req, res) => {
    const{event_name, event_type, date_of_event, aud_count, from_time, to_time, venue} = req.body;

    const report = new Report({event_name, event_type, date_of_event, aud_count, from_time, to_time, venue});
    
    try {
        await report.save();
        res.status(201).json({ success: true, message: 'Event reported successfully' });
    } catch (err) {
        console.error('Error saving report:', err);
        res.status(500).json({ success: false, message: 'Error reporting event' });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});