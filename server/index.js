import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import userApis from './api/users.js';
import groupApis from './api/groups.js';
import multer from 'multer';
import { v4 } from 'uuid';

await mongoose.connect('mongodb://localhost:27017/commonagenda');

let app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

let api = express();

api.use((req, res, next) => {
    console.log(`${req.method} ${req.path}, body: ${JSON.stringify(req.body)}, cookies: ${JSON.stringify(req.cookies)}`);
    next();
});

userApis(api);
groupApis(api);

const upload = multer({
    storage: multer.diskStorage({
        destination: './upload',
        filename: (_, file, cb) => {
            console.log(file);
            cb(null, v4());
        }
    })
});

api.post('/upload/img', upload.single('img'), async (req, res) => {
    res.send(req.file);
});

app.use('/api', api);

app.listen(4000);
console.log('listening on port 4000');
