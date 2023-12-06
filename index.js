const express = require('express');
const app = express();
const sql = require('mssql');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const config = require('./config');
const userRoutes = require('./routes/userRoutes');

app.use(express.json());
app.use(cors());
app.use(cookieParser());

sql.connect(config).then(pool => {
    console.log('Connected Successfully');
    //return pool.request().query(`Connected Successfully with ms`);
}).catch(err => {
    console.error('Error', err);
});

app.use('/users', userRoutes);

app.get('/', (req, res) => {
    res.send('Hello Cookies')
})

const port = 3000;
app.listen(port, () => {
    console.log(`Server Running on port: ${port}`);
});