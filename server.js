const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: 'http://127.0.0.1:5501' })); // Allow CORS for your frontend origin

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'localhost1',
    password: 'Glenravel54!',
    database: 'learnlist_db'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Database connected!');
});

// Register user
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    console.log(req.body); // Debugging line
    const hashedPassword = bcrypt.hashSync(password, 8);

    const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.query(query, [username, email, hashedPassword], (err, result) => {
        if (err) {
            console.error('Error inserting user:', err); // Debugging line
            return res.status(500).send('Server error');
        }
        res.status(201).send({ message: 'User registered!' });
    });
});

// Login user
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], (err, result) => {
        if (err) {
            console.error('Server error:', err);
            return res.status(500).send('Server error');
        }
        if (result.length === 0) {
            console.error('User not found');
            return res.status(404).send('User not found');
        }

        const user = result[0];
        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) {
            console.error('Invalid password');
            return res.status(401).send('Invalid password');
        }

        const token = jwt.sign({ id: user.id }, 'secret', { expiresIn: 86400 }); // 24 hours
        console.log('User login successful. Username:', user.username); // Log the username
        res.status(200).send({ auth: true, token, username: user.username }); // Ensure username is sent here
    });
});

// Fetch user's learnlist
app.get('/learnlist', (req, res) => {
    const token = req.query.token;

    try {
        const decoded = jwt.verify(token, 'secret');
        const query = 'SELECT * FROM learnlist WHERE user_id = ?';
        db.query(query, [decoded.id], (err, results) => {
            if (err) {
                console.error('Error fetching learnlist items:', err);
                return res.status(500).send('Server error');
            }
            res.status(200).send(results);
        });
    } catch (err) {
        console.error('Error verifying token:', err);
        res.status(401).send('Unauthorized');
    }
});

// Add learnlist item
app.post('/learnlist', (req, res) => {
    const { token, title, description, url } = req.body;

    try {
        const decoded = jwt.verify(token, 'secret');
        const query = 'INSERT INTO learnlist (user_id, title, description, url) VALUES (?, ?, ?, ?)';
        db.query(query, [decoded.id, title, description, url], (err, result) => {
            if (err) {
                console.error('Error inserting learnlist item:', err);
                return res.status(500).send('Server error');
            }
            res.status(201).send({ message: 'Learnlist item added!' });
        });
    } catch (err) {
        console.error('Error verifying token:', err);
        res.status(401).send('Unauthorized');
    }
});

// Delete learnlist item
app.delete('/learnlist/:id', (req, res) => {
    const token = req.body.token;
    const itemId = req.params.id;

    try {
        const decoded = jwt.verify(token, 'secret');
        const query = 'DELETE FROM learnlist WHERE id = ? AND user_id = ?';
        db.query(query, [itemId, decoded.id], (err, result) => {
            if (err) {
                console.error('Error deleting learnlist item:', err);
                return res.status(500).send('Server error');
            }
            res.status(200).send({ message: 'Learnlist item deleted!' });
        });
    } catch (err) {
        console.error('Error verifying token:', err);
        res.status(401).send('Unauthorized');
    }
});

// Get learnlist items for a user
app.get('/learnlist', (req, res) => {
    const token = req.query.token;

    try {
        const decoded = jwt.verify(token, 'secret');
        const query = 'SELECT * FROM learnlist WHERE user_id = ?';
        db.query(query, [decoded.id], (err, results) => {
            if (err) {
                console.error('Error fetching learnlist items:', err);
                return res.status(500).send('Server error');
            }
            res.status(200).send(results);
        });
    } catch (err) {
        console.error('Error verifying token:', err);
        res.status(401).send('Unauthorized');
    }
});

// Get all learnlist items
app.get('/all-learnlists', (req, res) => {
    const query = `
        SELECT users.username, learnlist.title, learnlist.description, learnlist.url
        FROM learnlist
        JOIN users ON learnlist.user_id = users.id
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching all learnlists:', err);
            return res.status(500).send('Server error');
        }
        res.status(200).send(results);
    });
});


// Start server
const PORT = 3002;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});








