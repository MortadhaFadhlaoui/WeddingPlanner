// addevent.route.js
const path = require('path');
const express = require('express');
const app = express();
const multer = require('multer');

const uploadImageRoutes = express.Router();
const DIR = '../public/assets';
let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DIR);
    },
    filename: (req, file, cb) => {
        cb(null,Date.now() + path.extname(file.originalname));
    }
});


let upload = multer({storage: storage});

// Upload single image
uploadImageRoutes.route('/upload').post(upload.single('file'), function (req, res) {
    if (!req.file) {
        console.log("No file received");
        return res.status(400).json({"message":"No file received"});

    } else {
        console.log('file received');
        return res.status(200).json(req.file.filename);
    }
});


/*// Upload multiple images
uploadImageRoutes.route('/uploadMulti').post(upload.any(), function (req, res) {
    if (!req.files) {
        console.log("No files received");
        return res.status(400).json({"message":"No file received"});

    } else {
        var names = [];
        for (var i=0; i<req.files.length;i++){
            names.push(req.files[i].filename);
        }
        console.log('file received');
        return res.status(200).json(names);
    }
});*/


// Upload multiple images
uploadImageRoutes.route('/uploadMulti').post(upload.any(),function (req, res) {
    if (!req.files) {
        console.log("No files received");
        return res.status(400).json({"message":"No file received"});

    } else {
        console.log('file received');
        return res.status(200).json({"names":"file received","DIR":DIR});
    }
});

module.exports = uploadImageRoutes;