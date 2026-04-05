const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const users = []; // Temporary Database

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
    secret: 'luxe-mac-secret-123',
    resave: false,
    saveUninitialized: true
}));

// --- HTML GENERATOR FOR SUCCESS/ERROR PAGES ---
function renderStatusPage(title, message, btnText, btnLink) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap" rel="stylesheet">
        <style>body { font-family: 'Plus Jakarta Sans', sans-serif; }</style>
    </head>
    <body class="bg-slate-50 min-h-screen flex items-center justify-center p-6">
        <div class="bg-white w-full max-w-md p-12 rounded-[3rem] shadow-2xl shadow-indigo-100 text-center border border-slate-100 animate-in fade-in zoom-in duration-300">
            <div class="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-8">
                ${title.includes('Created') || title.includes('Welcome') ? '✓' : '✕'}
            </div>
            <h1 class="text-3xl font-800 text-slate-900 mb-3">${title}</h1>
            <p class="text-slate-500 font-medium mb-10 leading-relaxed">${message}</p>
            <a href="${btnLink}" class="inline-block w-full bg-slate-900 text-white py-4 rounded-2xl font-800 hover:bg-indigo-600 transition-all duration-300 transform active:scale-95 shadow-xl shadow-slate-200">
                ${btnText}
            </a>
        </div>
    </body>
    </html>`;
}

// --- ROUTES ---

// SIGNUP: Process new user
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword });
    res.send(renderStatusPage("Account Created! ✨", "Your premium access is ready. Please sign in to continue.", "Sign In", "/"));
});

// LOGIN: Verify user
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);

    if (user && await bcrypt.compare(password, user.password)) {
        req.session.userId = username;
        res.send(renderStatusPage(`Welcome back, ${username} 👋`, "You have successfully accessed your secure portal.", "Logout", "/logout"));
    } else {
        res.status(401).send(renderStatusPage("Access Denied 🔒", "The credentials you entered do not match.", "Try Again", "/"));
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.listen(3000, () => console.log('🚀 LUXE Server live at http://localhost:3000'));