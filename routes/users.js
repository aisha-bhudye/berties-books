
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const saltRounds = 10;

const { check, validationResult } = require("express-validator");
const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('./login');
    } else {
        next();
    }
};
// GET register page
router.get("/register", function (req, res, next) {
    res.render("register.ejs", {
        shopData: req.app.locals.shopData,
        errors: []        // send empty error list on first load
    });
});
// REGISTER USER 
router.post(
    "/registered",

    // VALIDATION RULES
    [
        check("email")
            .isEmail()
            .withMessage("Invalid email address"),

        check("username")
            .isLength({ min: 5, max: 20 })
            .withMessage("Username must be 5–20 characters"),

        check("password")
            .isLength({ min: 8 })
            .withMessage("Password must be at least 8 characters long"),

        check("first")
            .notEmpty()
            .withMessage("First name required"),

        check("last")
            .notEmpty()
            .withMessage("Last name required")
    ],

    function (req, res, next) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.render("register.ejs", {
                shopData: req.app.locals.shopData,
                errors: errors.array()
            });
        }

        // SANITISE INPUTS
        let first = req.sanitize(req.body.first);
        let last = req.sanitize(req.body.last);
        let username = req.sanitize(req.body.username);
        let email = req.sanitize(req.body.email);

        const plainPassword = req.body.password;

        bcrypt.hash(plainPassword, saltRounds, function (err, hashedPassword) {
            if (err) return next(err);

            let sql = `
                INSERT INTO users (username, first, last, email, hashedPassword)
                VALUES (?, ?, ?, ?, ?)
            `;

            let params = [
                username,
                first,
                last,
                email,
                hashedPassword
            ];

            db.query(sql, params, function (err, result) {
                if (err) return next(err);

                res.send(`
                    Hello ${first} ${last}, you are now registered!
                    We will send an email to ${email}.<br><br>
                    Your hashed password is: ${hashedPassword}
                `);
            });
        });
    }
);

// LIST USERS (protected)
router.get("/list", redirectLogin, function (req, res, next) {
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
            db.query(
                "INSERT INTO login_audit (username, success, ip_address) VALUES (?, ?, ?)",
                [username, false, ipAddress]
            );
            return next(err);
        }

        if (result.length === 0) {
            db.query(
                "INSERT INTO login_audit (username, success, ip_address) VALUES (?, ?, ?)",
                [username, false, ipAddress]
            );
            return res.send("Login failed: User not found");
        }

        const hashedPassword = result[0].hashedPassword;

        bcrypt.compare(plainPassword, hashedPassword, function (err, match) {
            if (err) {
                db.query(
                    "INSERT INTO login_audit (username, success, ip_address) VALUES (?, ?, ?)",
                    [username, false, ipAddress]
                );
                return next(err);
            }

            if (match) {
                req.session.userId = username;

                db.query(
                    "INSERT INTO login_audit (username, success, ip_address) VALUES (?, ?, ?)",
                    [username, true, ipAddress]
                );

                res.send("Login successful! Welcome back, " + username);
            } else {
                db.query(
                    "INSERT INTO login_audit (username, success, ip_address) VALUES (?, ?, ?)",
                    [username, false, ipAddress]
                );
                res.send("Login failed: Incorrect password");
            }
        });
    });
});

// AUDIT LOG (protected)
router.get("/audit", redirectLogin, function (req, res, next) {
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

// LOGOUT
router.get("/logout", redirectLogin, (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('./');
        }
        res.send("You are now logged out. <a href='./'>Home</a>");
    });
});

module.exports = router;
