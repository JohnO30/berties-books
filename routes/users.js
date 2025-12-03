// routes/users.js
const express = require("express");
const bcrypt = require("bcrypt");
const { check, validationResult } = require('express-validator');
const router = express.Router();
const db = global.db;
const saltRounds = 10;


// Authorisation 

const redirectLogin = (req, res, next) => {
  if (!req.session.userId) {
    res.redirect('/login');
  } else {
    next();
  }
};

// Login audit function

function logLoginAttempt(username, success) {
  const status = success ? 'SUCCESS' : 'FAIL';
  const message = success ? 'Login successful' : 'Invalid username or password';

  const sql = `
    INSERT INTO login_audit (username, status, message)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [username, status, message], function (err) {
    if (err) {
      console.error("Error logging login attempt:", err);
    }
  });
}

// Get users/register
router.get("/register", function (req, res, next) {
  res.render("register.ejs");
});

// Post users/registered
router.post(
  '/registered',
  [
    check('email').isEmail(),
    check('username').isLength({ min: 5, max: 20 }),
    check('password')
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/)
  ],
  function (req, res, next) {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render('register.ejs', { errors: errors.array() });
    }

    // Sanitised inputs 
    const username = req.sanitize(req.body.username);
    const first    = req.sanitize(req.body.first);
    const last     = req.sanitize(req.body.last);
    const email    = req.sanitize(req.body.email);
    const password = req.body.password; // Do not sanitise passwords

    bcrypt.hash(password, saltRounds, function (err, hashedPassword) {
      if (err) {
        return res.status(500).send("Error hashing password.");
      }

      const sql = `
        INSERT INTO users (username, first, last, email, hashedPassword)
        VALUES (?, ?, ?, ?, ?)
      `;

      db.query(
        sql,
        [username, first, last, email, hashedPassword],
        function (err, result) {
          if (err) {
            return res.status(500).send("Error saving user.");
          }

          res.send("Registration successful for " + username);
        }
      );
    });
  }
);

// Get users/list
router.get("/list", redirectLogin, function (req, res, next) {
  const sql = "SELECT username, first, last, email FROM users";

  db.query(sql, function (err, rows) {
    if (err) {
      console.error("Error fetching users:", err);
      return res.status(500).send("Error fetching users.");
    }

    res.render("listusers.ejs", { users: rows });
  });
});

// 
router.post("/loggedin", function (req, res, next) {
  const { username, password } = req.body;

  const sql = "SELECT hashedPassword FROM users WHERE username = ?";

  db.query(sql, [username], function (err, rows) {
    if (err) {
      console.error("Error fetching user:", err);
      return res.status(500).send("Error during login.");
    }

    if (rows.length === 0) {
      logLoginAttempt(username, false);
      return res.send("Login failed: incorrect username or password.");
    }

    const hashedPassword = rows[0].hashedPassword;

    bcrypt.compare(password, hashedPassword, function (err, same) {
      if (err) {
        console.error("Error comparing passwords:", err);
        return res.status(500).send("Error during login.");
      }

      if (same) {
        logLoginAttempt(username, true);

        // Session set before response (Lab 8a)
        req.session.userId = username;

        res.send("Login successful! Welcome, " + username);
      } else {
        logLoginAttempt(username, false);
        res.send("Login failed: incorrect username or password.");
      }
    });
  });
});


// Get users/logout (PUBLIC - no redirectLogin needed)

router.get("/logout", function (req, res, next) {
  req.session.destroy(function (err) {
    if (err) {
      return next(err);
    }
    res.send('You are now logged out. <a href="../">Home</a>');
  });
});

// Get user/audit

router.get("/audit", redirectLogin, function (req, res, next) {
  const sql = "SELECT * FROM login_audit ORDER BY login_time DESC";

  db.query(sql, function (err, rows) {
    if (err) {
      console.error("Error fetching audit log:", err);
      return res.status(500).send("Error fetching audit log.");
    }

    res.render("audit.ejs", { logs: rows });
  });
});


// Export router
module.exports = router;
