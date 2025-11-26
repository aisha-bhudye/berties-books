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
- Implemented `/users/audit` route that displays all login attempts in chronological order
- The audit log shows: username, timestamp, success/failure status, and IP address
- Failed attempts are logged for: non-existent users, incorrect passwords, and database errors

### Features:
- Timestamps are automatically recorded using MySQL's `CURRENT_TIMESTAMP`
- IP addresses are captured from the request object
- Records are displayed in reverse chronological order (newest first). 

# Lab 8 – Authorisation, Validation & Sanitisation

## Part A — Authorisation (Lab 8a)

### express-session

I installed and configured `express-session` in `index.js`:
```js
app.use(
  session({
    secret: 'somerandomstuff',
    resave: false,
    saveUninitialized: false,
    cookie: { expires: 600000 }
  })
);
```

This enables session management so the application can remember if a user is logged in.

---

### Creating the login session

When a user logs in successfully, their username is stored in the session:
```js
req.session.userId = req.body.username;
```

This allows the app to identify the logged-in user on future requests.

---

### Access Control (redirectLogin middleware)
```js
const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('./login');
    } else {
        next();
    }
};
```

This middleware ensures that certain pages can only be viewed by authenticated users.

---

### Protected Routes

I applied `redirectLogin` to:

* `/users/list`
* `/users/audit`
* `/users/logout`

**Reasoning:**  
These pages contain sensitive information (user data and login audit logs). They must not be viewable by visitors who are not logged in.

**Routes left public:**

* `/users/register`
* `/users/login`
* Homepage

These must remain accessible to every user.

---

### Logout

Implemented logout:
```js
req.session.destroy(...)
```

This fully clears the session so the user is logged out securely.

---

## Part B — Validation (Lab 8bc)

I used **express-validator** to validate all input fields on the registration form.

---

### Validation rules

Added inside the `/registered` POST route:
```js
check("email").isEmail().withMessage("Invalid email address"),
check("username").isLength({ min: 5, max: 20 }).withMessage("Username must be 5–20 characters"),
check("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),
check("first").notEmpty().withMessage("First name required"),
check("last").notEmpty().withMessage("Last name required")
```

**Reasoning:**

* Emails must be valid
* Usernames must be long enough to avoid duplicates or unsafe data
* Passwords must meet minimum security standards
* First and last name cannot be blank

If validation fails, the user is returned to the registration page with detailed error messages.

---

### Displaying validation errors

Errors appear at the top of the `register.ejs` form:
```ejs
<% if (errors.length > 0) { %>
  <div style="color:red;">
    <ul>
      <% var i = 0; i < errors.length; i++{ %>
        <li><%= errors[i].msg%></li>
      <% }; %>
    </ul>
  </div>
<% } %>
```

This improves usability and prevents invalid data from being saved to the database.

---

## Part C — Sanitisation (Lab 8bc)

I added **express-sanitizer** to remove potentially dangerous input.

In `index.js`:
```js
app.use(expressSanitizer());
```

---

### Sanitisation applied to user input
```js
let first = req.sanitize(req.body.first);
let last = req.sanitize(req.body.last);
let username = req.sanitize(req.body.username);
let email = req.sanitize(req.body.email);
```

This removes harmful HTML/JS that could be used in a Cross-Site Scripting (XSS) attack.

---

### XSS Testing

I tested the application with:
```
Henry <script>alert("Hacked!")</script>
```

Before sanitisation, this displayed a JavaScript popup.

After sanitisation:

* No popup appeared
* Script tags were removed
* The input was displayed safely

**This confirms the application is protected from XSS.**

---

### Fields intentionally *not* sanitised

* **Password**

**Reason:** Sanitising passwords can remove characters, altering the value before hashing. This would cause failed logins and corrupt stored hashes.

All other user-submitted text fields were sanitised because they appear in HTML responses and could otherwise introduce XSS.

---

## Other Sanitisation Notes

* Numeric IDs and backend-only fields were not sanitised because they never appear in a browser and do not pose XSS risk.
* Only text fields were sanitised since those are most likely to contain unsafe HTML or JS.

---


### AI Declaration

I acknowledge the use of [1] ChatGPT (https://chat.openai.com/) to [2] assist with identifying and debugging errors in my code, clarifying programming concepts, and suggesting improvements to code structure. I entered the following prompts on Accessed: 16 November 2025 - 4 Decemeber 2025:

[3] Example prompts used:

“Explain why this error message appears in my code and how to fix it.”

“Suggest a clearer way to structure this function.”

“What is the correct syntax for implementing this feature?”

[4] The output from the generative artificial intelligence was used only to understand errors, explore potential solutions, and improve the organisation of my code. No AI-generated code was copied or included in the final submitted application. All implementation decisions and final code are my own.

## Reference

OpenAI (2025) ChatGPT [Generative AI model]. Available at: https://chat.openai.com/ (Accessed: 16 November 2025 - 4 Decemeber 2025).