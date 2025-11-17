# Insert data into the tables

USE berties_books;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100),
    first VARCHAR(100),
    last VARCHAR(100),
    email VARCHAR(200),
    hashedPassword VARCHAR(255)
);

-- Create login audit table
CREATE TABLE IF NOT EXISTS login_audit (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN NOT NULL,
    ip_address VARCHAR(45)
);

-- Clear existing data
DELETE FROM books;
DELETE FROM users;

-- Insert initial books
INSERT INTO books (name, price)
VALUES ('Brighton Rock', 20.25),
       ('Brave New World', 25.00),
       ('Animal Farm', 12.99);

-- Insert default user (username: gold, password: smiths)
INSERT INTO users (username, first, last, email, hashedPassword)
VALUES ('gold', 'Gold', 'Smith', 'gold@example.com', '$2b$10$RT5smKdglU.7OijrO.sAtOyvOOLoPWYrzlTs0Z5rdJETm7BMCApUy');



