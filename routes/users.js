// routes/users.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const saltRounds = 10;

// Show registration form
router.get("/register", (req, res, next) => {
  res.render("register.ejs");
});

// Handle registration form
router.post("/registered", (req, res, next) => {
  const { username, first, last, email, password } = req.body;

  // Hash the password
  bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
    if (err) {
      return next(err);
    }

    // Insert new user into the database
    const sqlquery = `
      INSERT INTO users (username, first_name, last_name, email, hashedPassword)
      VALUES (?, ?, ?, ?, ?)
    `;
    const newrecord = [username, first, last, email, hashedPassword];

    db.query(sqlquery, newrecord, (err, result) => {
      if (err) {
        return next(err);
      }
      res.send(
        `Hello ${first} ${last}, you are now registered! We will send an email to you at ${email}.`
      );
    });
  });
});

// List all users
router.get("/list", (req, res, next) => {
  const sqlquery =
    "SELECT id, username, first_name, last_name, email FROM users";

  db.query(sqlquery, (err, result) => {
    if (err) {
      return next(err);
    }
    res.render("listusers.ejs", { availableUsers: result });
  });
});

// Show login form
router.get("/login", (req, res, next) => {
  res.render("login.ejs");
});

// Handle login
router.post("/loggedin", (req, res, next) => {
  const username = req.body.username;
  const plainPassword = req.body.password;

  const sqlquery = "SELECT hashedPassword FROM users WHERE username = ?";

  db.query(sqlquery, [username], (err, result) => {
    if (err) {
      return next(err);
    }

    // No such user
    if (result.length === 0) {
      const auditQuery =
        "INSERT INTO login_audit (username, status, message) VALUES (?, ?, ?)";
      db.query(
        auditQuery,
        [username, "failed", "Username not found"],
        auditErr => {
          if (auditErr) console.error("Audit log error:", auditErr);
        }
      );
      return res.render("loggedin.ejs", {
        loginSuccess: false,
        username: username,
        errorMessage: "Username not found."
      });
    }

    const hashedPassword = result[0].hashedPassword;

    // Compare supplied password with stored hash
    bcrypt.compare(plainPassword, hashedPassword, (err, passwordsMatch) => {
      if (err) {
        return next(err);
      }

      if (passwordsMatch) {
        // Log success
        const auditQuery =
          "INSERT INTO login_audit (username, status, message) VALUES (?, ?, ?)";
        db.query(
          auditQuery,
          [username, "success", "Login successful"],
          auditErr => {
            if (auditErr) console.error("Audit log error:", auditErr);
          }
        );

        return res.render("loggedin.ejs", {
          loginSuccess: true,
          username: username,
          errorMessage: ""
        });
      } else {
        // Log incorrect password
        const auditQuery =
          "INSERT INTO login_audit (username, status, message) VALUES (?, ?, ?)";
        db.query(
          auditQuery,
          [username, "failed", "Incorrect password"],
          auditErr => {
            if (auditErr) console.error("Audit log error:", auditErr);
          }
        );

        return res.render("loggedin.ejs", {
          loginSuccess: false,
          username: username,
          errorMessage: "Incorrect password."
        });
      }
    });
  });
});

// Login audit history
router.get("/audit", (req, res, next) => {
  const sqlquery =
    "SELECT id, username, login_time, status, message FROM login_audit ORDER BY login_time DESC";

  db.query(sqlquery, (err, result) => {
    if (err) {
      return next(err);
    }
    res.render("audit.ejs", { auditRecords: result });
  });
});

module.exports = router;
