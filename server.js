const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Database connection
const db = mysql.createConnection({
    host: 'localhost', // Use 'localhost' if the MySQL server is on your local machine
    user: 'localhost1', // replace with your MySQL username
    password: 'Glenravel54!', // replace with your MySQL password
    database: 'learnlist_db' // replace with your actual database name
});


db.connect((err) => {
    if (err) throw err;
    console.log('Database connected!');
});

// Register user
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);

    const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.query(query, [username, email, hashedPassword], (err, result) => {
        if (err) return res.status(500).send('Server error');
        res.status(201).send({ message: 'User registered!' });
    });
});

// Login user
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], (err, result) => {
        if (err) return res.status(500).send('Server error');
        if (result.length === 0) return res.status(404).send('User not found');

        const user = result[0];
        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) return res.status(401).send('Invalid password');

        const token = jwt.sign({ id: user.id }, 'secret', { expiresIn: 86400 }); // 24 hours
        res.status(200).send({ auth: true, token });
    });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
