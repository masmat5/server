const express = require('express');
const sql = require('mssql');
const router = express.Router();
const config = require('../config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwt_secret = "A$neW$Token$";
const cookieParser = require('cookie-parser');

const { signupValidation, loginValidation } = require('../Validation');


router.post('/register',signupValidation, async (req, res) => {
    const { username, email, Upassword, phone, company, city } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(Upassword, 10);
        const request = new sql.Request();
        console.log(hashedPassword);
        const query = `INSERT INTO userdata (username, email, Upassword, phone, company, city)
                       VALUES (@username, @email, @Upassword, @phone, @company, @city)`;
        request.input('username', sql.NVarChar, username);
        request.input('email', sql.NVarChar, email);
        request.input('Upassword', sql.NVarChar, hashedPassword); // Store hashed password
        request.input('phone', sql.NVarChar, phone);
        request.input('company', sql.NVarChar, company);
        request.input('city', sql.NVarChar, city);
        await request.query(query);
        res.status(200).json({ message: 'User Registered Successfully' });
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
    
});


router.post('/login',loginValidation, async (req, res) => {
    const { password, email } = req.body;
    try {
        
        const request = new sql.Request();
        request.input('email', sql.NVarChar, email);


        const result = await request.query(
            `SELECT Upassword FROM userdata WHERE email = @email`
        );
        if (result.recordset.length > 0) {
            const hashedPassword = result.recordset[0].Upassword;
            const match = await bcrypt.compare(password , hashedPassword);
            if (match) {
                const token = jwt.sign({ email,password,phone,company }, jwt_secret, { expiresIn: '1h' });
                res.status(200).json({ message: 'Login successfully',token });
                console.log('Login successfully');
            } else {
                res.status(401).json({ message: 'Invalid credentials' });
                console.log('Invalid credentials');
            }
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
            console.log('Invalid');
        }
    } catch (err) {
        console.error('Error logging in:', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

router.get('/userdata', (req, res) => {
    
    const token = req.headers.authorization; 
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    // Verify the token
    jwt.verify(token, jwt_secret, async (err, decoded) => {
        if (err) {
            console.log(token, jwt_secret);
            return res.status(403).json({ message: 'Failed to authenticate token' });
        }
        const phone = decoded.phone;
        const company = decoded.company;
        const userEmail = decoded.email;
        const pas = decoded.password;
        console.log(userEmail,pas,phone,company);
        res.status(200).json({ message: 'Token authenticated successfully' });
    });
});
router.get('/cookie', function (req, res) {
    let minutes = 60 * 1000;
    res.cookie(cookieParser, minutes, { maxAge: minutes });
    return res.send('cookie has been set');
});
module.exports = router;