# Berties Books

A dynamic web application for managing and browsing books, built with Node.js, Express, and EJS templating.

## Features

### Book Management
- **List All Books** - View a complete catalog of all books in the database with their ID, name, and price
- **Add New Books** - Easy-to-use form for adding new books to the inventory with name and price validation
- **Search Functionality** - Advanced search feature with partial matching to find books by title
- **Bargain Books** - Special page displaying all books priced under £20

### User Features
- **User Registration** - Registration form for new users to sign up with the bookshop
- **Responsive Interface** - Clean, styled interface with consistent navigation across all pages
- **Dynamic Content** - All pages dynamically render data from the MySQL database

### Technical Features
- Server-side rendering with EJS templates
- MySQL database integration for persistent data storage
- Form validation and secure data handling
- RESTful routing structure
- Error handling middleware

## Available Routes

- `/` - Home page with navigation links
- `/about` - About the bookshop
- `/books/search` - Search for books
- `/books/list` - View all books
- `/books/addbook` - Add a new book
- `/books/bargainbooks` - View books under £20
- `/users/register` - User registration

## Setup Instructions

### Prerequisites
- Node.js (v12 or higher)
- MySQL Server
- npm (Node Package Manager)

### Installation

1. **Clone or download the repository**
   ```
   git clone <repository-url>
   cd berties-books
   ```

2. **Install dependencies**
   ```
   npm install
   ```

3. **Set up the database**
   - Create a MySQL database
   - Run the SQL scripts in the following order:
     ```
     mysql -u root -p < create_db.sql
     mysql -u root -p < myBookShop.sql
     mysql -u root -p < insert_test_data.sql
     ```

4. **Configure database connection**
   - Update the database credentials in `index.js` with your MySQL username and password

5. **Run the application**
   ```
   node index.js
   ```

6. **Access the application**
   - Open your browser and navigate to `http://localhost:8000`

## Project Structure

```
berties-books/
├── views/              # EJS template files
│   ├── index.ejs       # Home page
│   ├── about.ejs       # About page
│   ├── list.ejs        # Book list display
│   ├── addbook.ejs     # Add book form
│   ├── search.ejs      # Search form
│   └── register.ejs    # User registration
├── routes/             # Route handlers
│   ├── main.js         # Main routes
│   ├── books.js        # Book-related routes
│   └── users.js        # User-related routes
├── public/             # Static files
│   └── main.css        # Stylesheet
├── index.js            # Main application file
├── package.json        # Dependencies
└── *.sql              # Database setup scripts
```

## Technologies Used

- **Backend**: Node.js, Express.js
- **Templating**: EJS (Embedded JavaScript)
- **Database**: MySQL
- **Frontend**: HTML5, CSS3

## Development

This project was created for the Dynamic Web Applications module at Goldsmiths College.

### Key Dependencies
- `express` - Web application framework
- `ejs` - Templating engine
- `mysql` - MySQL database driver
- `express-sanitizer` - Input sanitization
- `express-validator` - Form validation
- `express-session` - Session management
