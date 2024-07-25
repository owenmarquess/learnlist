require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: 'http://127.0.0.1:5501' })); // Allow CORS for your frontend origin

// Database connection
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASS:', process.env.DB_PASS);
console.log('DB_NAME:', process.env.DB_NAME);

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Database connected!');
});

// Login endpoint
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM users WHERE email = ?';

    db.query(query, [email], (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).send('Server error');
        }

        if (results.length === 0) {
            return res.status(401).send('Invalid credentials');
        }

        const user = results[0];
        const isPasswordValid = bcrypt.compareSync(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).send('Invalid credentials');
        }

        const token = jwt.sign({ id: user.id }, 'secret', { expiresIn: '1h' });
        res.status(200).send({ auth: true, token, username: user.username });
    });
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
        
        console.log('User inserted with ID:', result.insertId); // Debugging info
        
        // Generate API key
        const apiKey = crypto.randomBytes(32).toString('hex');
        const userId = result.insertId;

        // Store API key in the database
        const apiKeyQuery = 'INSERT INTO api_keys (user_id, api_key) VALUES (?, ?)';
        db.query(apiKeyQuery, [userId, apiKey], (apiErr) => {
            if (apiErr) {
                console.error('Error inserting API key:', apiErr);
                return res.status(500).send('Server error');
            }

            console.log('API key inserted for user ID:', userId); // Debugging info
            res.status(201).send({ message: 'User registered!', apiKey });
        });
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

// Middleware to check API key
const checkApiKey = (req, res, next) => {
    const apiKey = req.header('x-api-key');
    if (!apiKey) {
        return res.status(401).send('API key is missing');
    }
    
    const query = 'SELECT * FROM api_keys WHERE api_key = ?';
    db.query(query, [apiKey], (err, results) => {
        if (err) {
            console.error('Error verifying API key:', err);
            return res.status(500).send('Server error');
        }
        if (results.length === 0) {
            return res.status(401).send('Invalid API key');
        }
        next();
    });
};

// Example protected route
app.get('/protected', checkApiKey, (req, res) => {
    res.send('This is a protected route');
});

// Start server
const PORT = 3004;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
















