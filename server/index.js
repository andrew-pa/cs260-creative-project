import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import userApis from './api/users.js';

await mongoose.connect('mongodb://localhost:27017/commonagenda');

let app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

let api = express();

api.use((req, res, next) => {
    console.log(`request for ${req.path}, body: ${JSON.stringify(req.body)}, cookies: ${JSON.stringify(req.cookies)}`);
    next();
});

userApis(api);

app.use('/api', api);

app.listen(4000);
console.log('listening on port 4000');
