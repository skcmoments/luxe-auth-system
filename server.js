const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();
const users = []; // Temporary database (stays in memory while server runs)

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
    secret: 'mac-luxe-secret',
    resave: false,
    saveUninitialized: true
}));

// SIGNUP ROUTE
app.post('/signup', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        users.push({ username, password: hashedPassword });
        res.send('<h1>Account Created!</h1><a href="/">Go to Login</a>');
    } catch {
        res.status(500).send("Error creating account");
    }
});

// LOGIN ROUTE
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);

    if (user && await bcrypt.compare(password, user.password)) {
        req.session.userId = username;
        res.send(`<h1>Welcome back, ${username}!</h1><a href="/logout">Logout</a>`);
    } else {
        res.status(401).send('<h1>Invalid credentials</h1><a href="/">Try again</a>');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.listen(3000, () => {
    console.log('🚀 LUXE Auth Server is live!');
    console.log('👉 http://localhost:3000');
});