const express = require('express');
const router = express.Router();

// Route to get all books as JSON (with extensions)
router.get('/books', function (req, res, next) {
    // Query database to get all the books
    let sqlquery = "SELECT * FROM books";
    let params = [];
    let conditions = [];
    
    // Task 3: Handle search parameter
    if (req.query.search) {
        conditions.push("name LIKE ?");
        params.push('%' + req.query.search + '%');
    }
    
    // Task 4: Handle minimum price
    if (req.query.minprice) {
        conditions.push("price >= ?");
        params.push(req.query.minprice);
    }
    
    // Task 4: Handle maximum price
    if (req.query.max_price) {
        conditions.push("price <= ?");
        params.push(req.query.max_price);
    }
    
    // Add WHERE clause if there are conditions
    if (conditions.length > 0) {
        sqlquery += " WHERE " + conditions.join(" AND ");
    }
    
    // Task 5: Handle sorting
    if (req.query.sort) {
        if (req.query.sort === 'name') {
            sqlquery += " ORDER BY name ASC";
        } else if (req.query.sort === 'price') {
            sqlquery += " ORDER BY price ASC";
        }
    }
    
    // Execute the sql query
    db.query(sqlquery, params, (err, result) => {
        // Return results as a JSON object
        if (err) {
            res.json(err);
            next(err);
        }
        else {
            res.json(result);
        }
    });
});

module.exports = router;


