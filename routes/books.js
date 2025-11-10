// Create a new router
const express = require("express")
const router = express.Router()
const shopData = {
    shopName: "Bertie's Books"
};

// router.get('/search',function(req, res, next){
//     res.render("search.ejs")
// });

// router.get('/search-result', function (req, res, next) {
//     //searching in the database
//     res.send("You searched for: " + req.query.keyword)
// });

// Route to display the search form
router.get('/search', function(req, res, next){
    res.render("search.ejs", {shopData: shopData}); // Pass shopData to template
});

// Route to handle search results - BASIC SEARCH (exact match)
router.get('/search_result', function (req, res, next) {
    let keyword = req.query.search_text; // Get search term from form
    
    // SQL query for exact match
    let sqlquery = "SELECT * FROM books WHERE name = ?";
    
    // Execute query
    db.query(sqlquery, [keyword], (err, result) => {
        if (err) {
            next(err);
        }
        else {
            res.render("search-result.ejs", {
                shopData: shopData,
                books: result,
                keyword: keyword
            });
        }
    });
});

router.get('/list', function(req, res, next) {
        let sqlquery = "SELECT * FROM books"; // query database to get all the books
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                next(err)
            }
            //res.send(result)
            res.render("list.ejs", {availableBooks: result})
         });
    });



// TASK 3: Add book page - shows the form
router.get('/addbook', function(req, res, next) {
    res.render("addbook.ejs")
});

router.post('/bookadded', function (req, res, next) {
    // saving data in database
    let sqlquery = "INSERT INTO books (name, price) VALUES (?,?)"
    // execute sql query
    let newrecord = [req.body.name, req.body.price]
    db.query(sqlquery, newrecord, (err, result) => {
        if (err) {
            next(err)
        }
        else
            res.send(' This book is added to database, name: '+ req.body.name + ' price '+ req.body.price)
    })
}) 


// BARGAIN BOOKS (Under £20)
router.get('/bargainbooks', function (req, res, next) {
    let sqlquery = "SELECT name, price FROM books WHERE price < 20"; // Query for books under £20

    // Execute SQL query
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err);
        } else {
            res.render("bargainbooks.ejs", { bargainBooks: result });
        }
    });
});



// Export the router object so index.js can access it
module.exports = router
