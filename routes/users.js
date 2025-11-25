// routes/users.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const saltRounds = 10;

// DB connection (your project uses global db, so we use it)
const db = global.db;

// Show registration form
router.get("/register", (req, res) => {
    res.render("register.ejs");
});

// Handle registration
router.post("/registered", (req, res, next) => {
    const { username, first, last, email, password } = req.body;

    // Hash password
    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
        if (err) return next(err);

        const sqlquery = `
            INSERT INTO users (username, first_name, last_name, email, hashedPassword)
            VALUES (?, ?, ?, ?, ?)
        `;

        const params = [username, first, last, email, hashedPassword];

        db.query(sqlquery, params, (err, result) => {
            if (err) return next(err);

            res.send(`Registration successful. Welcome ${first} ${last}!`);
        });
    });
});

// Show login form
router.get("/login", (req, res) => {
    res.render("login.ejs");
});

// Handle login
router.post("/loggedin", (req, res, next) => {
    const { username, password } = req.body;

    const sqlquery = "SELECT hashedPassword FROM users WHERE username = ?";

    db.query(sqlquery, [username], (err, results) => {
        if (err) return next(err);

        // No such user
        if (results.length === 0) {
            logAudit(username, "failed", "Username not found");
            return res.send("Login failed: Username not found.");
        }

        const hashedPassword = results[0].hashedPassword;

        // Check password
        bcrypt.compare(password, hashedPassword, (err, passwordMatches) => {
            if (err) return next(err);

            if (!passwordMatches) {
                logAudit(username, "failed", "Incorrect password");
                return res.send("Login failed: Incorrect password.");
            }

            // Success
            logAudit(username, "success", "Login successful");
            res.send(`Welcome back, ${username}! Login successful.`);
        });
    });
});


// List all books
router.get("/list", (req, res, next) => {
  const sqlquery = "SELECT * FROM books";

  db.query(sqlquery, (err, result) => {
    if (err) {
      return next(err);
    }
    res.render("list.ejs", { availableBooks: result });
  });
});

// Audit log helper
function logAudit(username, status, message) {
    const sql = `
        INSERT INTO login_audit (username, status, message)
        VALUES (?, ?, ?)
    `;
    db.query(sql, [username, status, message], err => {
        if (err) console.error("Audit log error:", err);
    });
}

// Show audit log
router.get("/audit", (req, res, next) => {
    const sqlquery = `
        SELECT id, username, login_time, status, message
        FROM login_audit
        ORDER BY login_time DESC
    `;

    db.query(sqlquery, (err, result) => {
        if (err) return next(err);
        res.render("audit.ejs", { auditRecords: result });
    });
});

module.exports = router;
