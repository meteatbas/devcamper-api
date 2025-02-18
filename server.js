const path=require('path');
const express=require('express');
const dotenv=require('dotenv');
const morgan=require('morgan');
const connectDB=require('./config/db');
const fileupload=require('express-fileupload');
const cookieParser=require('cookie-parser');
const errorHandler=require('./middleware/error')
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss=require('xss-clean');
const hpp=require('hpp');
const cors=require('cors');
const ratelimit=require('express-rate-limit');

//Load env variables
dotenv.config({path:'./config/config.env'});

//Connect to db
connectDB();


//Route files
const bootcamps=require('./routes/bootcamps');
const courses=require('./routes/courses');
const auth=require('./routes/auth'); 
const users=require('./routes/users'); 
const reviews=require('./routes/reviews'); 
const rateLimit = require('express-rate-limit');

const app =express();


//Body parser
app.use(express.json());


//Cookie parser 
app.use(cookieParser());


//Dev logging middleware
if (process.env.NODE_ENV==='development') {
    app.use(morgan('dev'));
}

//File uploading 
app.use(fileupload());

//Sanitize data
app.use(mongoSanitize());

//Prevent XSS attacks
app.use(xss());

//Set security headers
app.use(helmet());

//Rate limiting
const limiter=rateLimit({
    windowMs:10*60*1000, //10 minutes
    max:100
})

app.use(limiter);

//prevent http param pollution
app.use(hpp());


//Enable CORS
app.use(cors());

//Set static folder
app.use(express.static(path.join(__dirname,'public')));


//Mount routers
app.use('/api/v1/bootcamps',bootcamps);
app.use('/api/v1/courses',courses);
app.use('/api/v1/auth',auth);
app.use('/api/v1/users',users);
app.use('/api/v1/reviews',reviews);

app.use(errorHandler);



const PORT=process.env.PORT || 5000;

const server=app.listen(PORT,console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));

//Handle unhandled promise rejections

process.on('unhandledRejection',(err,promise)=>{
    console.log(`Error: ${err.message}`);
    //close server and exit process
    server.close(()=>process.exit(1));
    
});