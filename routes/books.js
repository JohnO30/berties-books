// routes/books.js
const express = require("express");
const router = express.Router();

// Show add book form
router.get("/addbook", (req, res, next) => {
  res.render("addbook.ejs");
});

// Show search page
router.get("/search", (req, res, next) => {
  res.render("search.ejs");
});

// Search results
router.get("/search-result", (req, res, next) => {
  // Term from the search form ?keyword=...
  const keyword = req.query.keyword || "";
  const searchTerm = `%${keyword}%`;

  const sqlquery = "SELECT * FROM books WHERE name LIKE ?";

  db.query(sqlquery, [searchTerm], (err, result) => {
    if (err) {
      return next(err);
    }
    res.render("list.ejs", { availableBooks: result });
  });
});




// Bargain books (price < £20)
router.get("/bargainbooks", (req, res, next) => {
  const sqlquery =
    "SELECT name, price FROM books WHERE price < 20";

  db.query(sqlquery, (err, result) => {
    if (err) {
      return next(err);
    }
    res.render("list.ejs", { availableBooks: result });
  });
});

// Add a book (form POST target)
router.post("/bookadded", (req, res, next) => {
  const { name, price } = req.body;

  const sqlquery =
    "INSERT INTO books (name, price) VALUES (?, ?)";
  const newrecord = [name, price];

  db.query(sqlquery, newrecord, (err, result) => {
    if (err) {
      return next(err);
    }
    res.send(
      `This book is added to the database. Name: ${name}, price: ${price}`
    );
  });
});

module.exports = router;
