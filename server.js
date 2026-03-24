const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const cors = require('cors'); 

// load env vars
dotenv.config({path:'./config/config.env'});

//connect to db
connectDB();

// route files
const hotels = require('./routes/hotels');
const auth = require('./routes/auth');
const bookings = require('./routes/bookings');

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));


//body parser
app.use(express.json());

//cookie parser
app.use(cookieParser());

//extended query parser
app.set('query parser', 'extended');

 //mount routers
app.use('/api/v1/hotels', hotels);
app.use('/api/v1/auth', auth);
app.use('/api/v1/bookings', bookings);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, console.log('Server running in ', process.env.NODE_ENV, ' mode on port ', PORT));

//handle unhandled promise rejections
process.on('unhandledRejection', (err,promise) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});