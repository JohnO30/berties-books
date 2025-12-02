const express = require("express");
const router = express.Router();
const db = global.db;

// Authorisation middleware
const redirectLogin = (req, res, next) => {
  if (!req.session.userId) {
    res.redirect('/users/login');
  } else {
    next();
  }
};

// Show search form (PUBLIC - no login required)
router.get('/search', function (req, res, next) {
  res.render("search.ejs");
});

// Handle search results (SANITISED)
router.get('/search-result', function (req, res, next) {
  const keyword = req.sanitize(req.query.keyword);

  const sqlquery = "SELECT * FROM books WHERE name LIKE ?";
  const params = ['%' + keyword + '%'];

  db.query(sqlquery, params, (err, result) => {
    if (err) {
      return next(err);
    }
    res.render('list.ejs', { availableBooks: result });
  });
});

// List all books (PROTECTED)
router.get('/list', redirectLogin, function (req, res, next) {
  const sqlquery = "SELECT * FROM books";

  db.query(sqlquery, (err, result) => {
    if (err) {
      return next(err);
    }
    res.render("list.ejs", { availableBooks: result });
  });
});

// Show the add book form (PROTECTED)
router.get('/addbook', redirectLogin, function (req, res, next) {
  res.render('addbook.ejs');
});

// Handle form submit and insert into DB (PROTECTED + SANITISED + VALIDATED)
router.post('/bookadded', redirectLogin, function (req, res, next) {
  const name = req.sanitize(req.body.name);
  const price = parseFloat(req.body.price);

  if (isNaN(price)) {
    return res.send("Invalid price. Must be a number.");
  }

  const sqlquery = "INSERT INTO books (name, price) VALUES (?, ?)";
  const newrecord = [name, price];

  db.query(sqlquery, newrecord, (err, result) => {
    if (err) {
      return next(err);
    }
    res.send('This book is added to database, name: ' + name + ' price ' + price);
  });
});

// Bargain books (PROTECTED)
router.get('/bargainbooks', redirectLogin, function (req, res, next) {
  const sqlquery = "SELECT * FROM books WHERE price < 20";

  db.query(sqlquery, (err, result) => {
    if (err) {
      return next(err);
    }
    res.render('list.ejs', { availableBooks: result });
  });
});

// Export the router object so index.js can access it
module.exports = router;
