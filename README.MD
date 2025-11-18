# Berties Books
This application allows the user to view the list of books available in store, search for books and add books 
# How to view application
links.txt has been provided with link.
# How to run application locally 
Uses node.js with Express and EJS.

To install and run:

npm install
node index.js
## dotenv

This application uses the `dotenv` module to securely manage database credentials. 

### Implementation:
- Database credentials are stored in a `.env` file which is not committed to version control
- The `.env` file contains: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME`
- These environment variables are loaded using `require('dotenv').config()` at the start of `index.js`
- The database connection pool reads credentials using `process.env.DB_HOST`, etc.
- A `.env.example` file is provided as a template showing required variables without exposing actual credentials

### Setup:
To run this application, create a `.env` file in the root directory based on `.env.example` and add your database credentials.

## Audit Logging

This application implements audit logging to track all login attempts for security monitoring.

### Implementation:
- Created a `login_audit` table with columns: `id`, `username`, `login_time`, `success`, and `ip_address`
- Modified the `/users/loggedin` route to log every login attempt (both successful and failed)
- Created a helper function `logLoginAttempt()` that inserts audit records into the database
- Implemented `/users/audit` route that displays all login attempts in chronological order
- The audit log shows: username, timestamp, success/failure status, and IP address
- Failed attempts are logged for: non-existent users, incorrect passwords, and database errors

### Features:
- Timestamps are automatically recorded using MySQL's `CURRENT_TIMESTAMP`
- IP addresses are captured from the request object
- Records are displayed in reverse chronological order (newest first). 
