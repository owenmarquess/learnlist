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
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Database connected!');
});

// Register user
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);

    const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.query(query, [username, email, hashedPassword], (err, result) => {
        if (err) {
            console.error('Error inserting user:', err);
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


// Add rating to a learnlist
app.post('/rate', (req, res) => {
    const { token, learnlistId, rating } = req.body;

    try {
        const decoded = jwt.verify(token, 'secret');
        const query = 'INSERT INTO ratings (user_id, learnlist_id, rating) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE rating = VALUES(rating)';

        db.query(query, [decoded.id, learnlistId, rating], (err, result) => {
            if (err) {
                console.error('Error inserting rating:', err);
                return res.status(500).send('Server error');
            }
            res.status(201).send({ success: true, message: 'Rating submitted!' });
        });
    } catch (err) {
        console.error('Error verifying token:', err);
        res.status(401).send('Unauthorized');
    }
});

// Get ratings for a learnlist
app.get('/ratings', (req, res) => {
    const { learnlistId } = req.query;

    const query = 'SELECT rating FROM ratings WHERE learnlist_id = ?';

    db.query(query, [learnlistId], (err, results) => {
        if (err) {
            console.error('Error fetching ratings:', err);
            return res.status(500).send('Server error');
        }

        const ratings = results.map(result => result.rating);
        const averageRating = ratings.length ? (ratings.reduce((a, b) => a + b) / ratings.length) : 0;
        res.status(200).send({ averageRating, ratingsCount: ratings.length });
    });
});

// Start server
const PORT = 3002;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});











