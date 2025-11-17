
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const saltRounds = 10;

// GET register page
router.get("/register", function (req, res, next) {
    res.render("register.ejs", { shopData: req.app.locals.shopData });
});

// REGISTER USER
router.post("/registered", function (req, res, next) {
    const plainPassword = req.body.password;

    bcrypt.hash(plainPassword, saltRounds, function (err, hashedPassword) {
        if (err) return next(err);

        let sql = `
            INSERT INTO users (username, first, last, email, hashedPassword)
            VALUES (?, ?, ?, ?, ?)
        `;

        let params = [
            req.body.username,
            req.body.first,
            req.body.last,
            req.body.email,
            hashedPassword
        ];

        db.query(sql, params, function (err, result) {
            if (err) return next(err);

            res.send(`
                Hello ${req.body.first} ${req.body.last}, you are now registered!
                We will send an email to ${req.body.email}.<br><br>
                Your hashed password is: ${hashedPassword}
            `);
        });
    });
});

// LIST USERS
router.get("/list", function (req, res, next) {
    let sql = `SELECT username, first, last, email FROM users`;

    db.query(sql, function (err, results) {
        if (err) return next(err);

        res.render("listusers.ejs", {
            users: results,
            shopData: req.app.locals.shopData
        });
    });
});

// LOGIN FORM
router.get("/login", function (req, res, next) {
    res.render("login.ejs");
});

// LOGIN PROCESSING
router.post("/loggedin", function (req, res, next) {
    const username = req.body.username;
    const plainPassword = req.body.password;
    const ipAddress = req.ip;

    let sqlquery = "SELECT hashedPassword FROM users WHERE username = ?";

    db.query(sqlquery, [username], (err, result) => {
        if (err) {
            logLoginAttempt(username, false, ipAddress);
            return next(err);
        }

        if (result.length === 0) {
            logLoginAttempt(username, false, ipAddress);
            return res.send("Login failed: User not found");
        }

        const hashedPassword = result[0].hashedPassword;

        bcrypt.compare(plainPassword, hashedPassword, function (err, match) {
            if (err) {
                logLoginAttempt(username, false, ipAddress);
                return next(err);
            }

            if (match) {
                logLoginAttempt(username, true, ipAddress);
                res.send("Login successful! Welcome back, " + username);
            } else {
                logLoginAttempt(username, false, ipAddress);
                res.send("Login failed: Incorrect password");
            }
        });
    });
});

// AUDIT LOG
router.get("/audit", function (req, res, next) {
    let sql = `
        SELECT id, username, login_time, success, ip_address 
        FROM login_audit 
        ORDER BY login_time DESC
    `;

    db.query(sql, function (err, results) {
        if (err) return next(err);

        res.render("audit.ejs", {
            audits: results,
            shopData: req.app.locals.shopData
        });
    });
});

// LOG ATTEMPT
function logLoginAttempt(username, success, ipAddress) {
    let sql = "INSERT INTO login_audit (username, success, ip_address) VALUES (?, ?, ?)";
    db.query(sql, [username, success, ipAddress], (err) => {
        if (err) console.error("Error logging login attempt:", err);
    });
}

module.exports = router;
