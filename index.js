require('dotenv');

const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const morgan = require('morgan');
const PORT = process.env.PORT || 9000;

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(morgan('dev'));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/upload',express.static(path.join(__dirname, 'upload')));

const storage = multer.diskStorage({
    destination:(req, file, cb) => {
        cb(null, path.join(__dirname, 'upload'))
    },
    filename:(req, file, cb) => {
        cb(null, file.fieldname + Date.now() + '-' + path.extname(file.originalname))
    }
});

const filter = (req, file, cb) => {
    const fileType = /jpeg|jpg|png|gif|mp4|mov|avi|mkv/
    const extname = fileType.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileType.test(file.mimetype);

    if (mimeType && extname) {
        return cb(null, true)
    }

    return cb(new Error('Only images and videos are allowed !'));
}

const upload = multer({
    storage : storage,
    limits : { fileSize : 10 * 1024 * 1024},
    fileFilter : filter
});


app.get('/home', (req, res) => {
    res.status(200).json({msg:'this is Home Page.'});
});

app.get('/upload', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'upload.html'));
});

app.post('/api/upload', upload.single('myFile'), (req, res) => {
    if (!req.file) {
        return res.status(404).json({faild:'No file uploded !'});
    }
    res.status(201).json({success:'file uploded successfully.'});
});

app.get('/gallery', (req, res) => {
    const dir = path.join(__dirname, 'upload');
    fs.readdir(dir, (err, files) => {
        if (err) {
            return res.status(404).json({error:'failed to read files !'});
        }
        const filterdFile = files.filter(file => /\.(jpeg|jpg|png|gif|mp4|mov|avi|mkv)$/i.test(file));
        res.status(200).json(filterdFile);
    });
});


app.listen(PORT,() => console.log(`http://localhost:${PORT}.`));