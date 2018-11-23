// index.js

const express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    mongoose = require('mongoose'),
    config = require('./config/DB');
const http = require('http');
var fs = require('fs');
const taskRoutes = require('./routes/task.route');
const guestRoutes = require('./routes/guest.route');
const userRoutes = require('./routes/user.route');
const uploadImageRoutes = require('./routes/uploadimage.route');
var publicDir = require('path').join(__dirname,'/public');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || config.DB,{ useNewUrlParser: true }).then(
    () => {console.log('Database is connected') },/** ready to use. The `mongoose.connect()` promise resolves to undefined. */
    err => { console.log('Can not connect to the database'+ err)}/** handle initial connection error */
);

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(cors({origin: '*'}));
app.use(express.static(publicDir));


app.use('/task',taskRoutes);
app.use('/guest',guestRoutes);
app.use('/user',userRoutes);
app.use('/image', uploadImageRoutes);
const port = process.env.PORT || 4000;

// your express configuration here
app.listen(port, () => {
    console.log(`Server listening on port ${port}.`);
});