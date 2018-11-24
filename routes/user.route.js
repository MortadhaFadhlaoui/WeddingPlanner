const express = require('express');
const bcrypt = require('bcrypt');
var crypto = require('crypto');
const userRoutes = express.Router();
const nodemailer = require('nodemailer');
const fs = require('fs');
const { promisify } = require('util');
const DIR = '../public/assets';

const unlink = promisify(fs.unlink);
// nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'plannerweeding2@gmail.com',
        pass: 'WeddingPlanner2018'
    }
});


let User = require('../models/User');
let Wedding = require('../models/Wedding');
let Token = require('../models/Token');

// Defined store route
userRoutes.route('/addWithWedding').post(function (req, res) {
    User.findOne({email:req.body.emailPartner}, function (err, user){
        if (user){
            res.status(400).send("user already have a partner");
        } else {
            Wedding.findOne({emailPartner:req.body.emailPartner}, function (err, wedding){
                if (!wedding){
                    //hash password
                    let hash = bcrypt.hashSync(req.body.password, 10);

                    let user = new User(req.body);
                    user.password = hash;
                    console.log(user);
                    user.save()
                        .then(user => {
                            sendToken(user,err,req);
                            let wedding = new Wedding(req.body);
                            console.log(wedding);
                            wedding.partner1 = user._id;
                            wedding.save()
                                .then(wedding =>{
                                    const mailOptions = {
                                        from: 'WeddingTime <'+user.email+'>',
                                        to: wedding.emailPartner,
                                        subject: 'Join Your Partner',
                                        text: user.firstName +' '+user.lastName+' ('+user.email+') invited you to be his partner 👥'
                                    };
                                    transporter.sendMail(mailOptions, function(error, info){
                                        if (error) {
                                            console.log(error);
                                        } else {
                                            console.log('Email sent: ' + info.response);
                                        }
                                    });
                                    res.status(200).json({"user":user,"wedding":wedding});
                                })
                                .catch(err=>{
                                    res.status(400).send("unable to save wedding to database");
                                })
                        })
                        .catch(err => {
                            console.log(err.message);
                            res.status(400).send("unable to save user to database");
                        });
                }
                else {
                    res.status(400).send("user already have a partner");
                }
            });
        }
    });
});


// Defined login route
userRoutes.route('/login').post(function (req, res) {
    User.findOne({email:req.body.email}, function (err, user){
        if (!user){
             res.status(404).json({"message": 'No user with this email'});
        }else {
            if (user.isVerified){
                bcrypt.compare(req.body.password, user.password, function(err, result) {
                    console.log(result);
                    if(result) {
                        Wedding.findOne({$or: [
                                {partner1: user},
                                {partner2: user}
                            ]}, function (err, wedding){
                            if (!wedding){
                                res.status(404).send({"message":"wedding not found"});
                            }  else {
                                if (user._id.equals(wedding.partner1) &&  wedding.partner2){
                                    findPartner(wedding.partner2,user,wedding,res)
                                } else if (user._id.equals(wedding.partner2) &&  wedding.partner1) {
                                    findPartner(wedding.partner1,user,wedding,res)
                                }else {
                                    res.status(200).json({"user":user,"wedding":wedding});
                                }
                            }
                                });
                    } else {
                        res.status(400).json({"message": 'Passwords don\'t match'});
                    }
                });
            } else {
                res.status(403).json({"message": 'Please confirm your email to login'});
            }
        }
    });
});

function findPartner(id,user1,wedding,res){
    User.findById(id, function (err, user){
        if (user){
            res.status(200).json({"user":user1,"wedding":wedding,"partner":user});
        } else {
            res.status(404).json({"message": 'user not found'});
        }
    });
}
// Defined get data(index or listing) route
userRoutes.route('/get').get(function (req, res) {
    User.find(function (err, users){
        if(err){
            console.log(err);
        }
        else {
            res.json(users);
        }
    });
});


// Defined get data(index or listing) route
userRoutes.route('/checkEmail').post(function (req, res) {
    User.findOne({email:req.body.email}, function (err, user){
        if (user){
            res.status(200).send("email already exists");
        } else {
            Wedding.findOne({emailPartner:req.body.email}, function (err, wedding){
                if (!wedding){
                    res.status(400).send("email does not exists");
                }
                else {
                    let hash = bcrypt.hashSync(req.body.password, 10);
                    let user = new User(req.body);
                    user.password = hash;
                    user.save()
                        .then(user => {
                            sendToken(user,err,req);
                            wedding.partner2 = user._id;
                            wedding.save().then(wedding => {
                                res.status(200).send("Welcome Partner");
                            })
                                .catch(err => {
                                    res.status(400).send("unable to update the wedding");
                                });
                        })
                        .catch(err => {
                            res.status(400).send("unable to save user to database");
                        });
                }
            });
        }
    });
});

// Defined get data(index or listing) route
userRoutes.route('/updateUser').post(function (req, res) {
    bcrypt.compare(req.body.password, req.body.user.password, function(err, result) {
        if(result) {
            if (req.body.email === req.body.user.email){
                updateUserFunction(req.body.email,req.body.user.email,req, res)
            }else{
                User.findOne({email:req.body.email}, function (err, user){
                    if (user){
                        res.status(400).json({"message": 'email already exists'});
                    } else {
                        updateUserFunction(req.body.email,req.body.user.email,req, res)
                    }
                });
            }
        } else {
            res.status(400).json({"message": 'Passwords don\'t match'});
        }
    });
});

// Defined get data(index or listing) route
userRoutes.route('/updatePhoto').post(function (req, res) {
    bcrypt.compare(req.body.password, req.body.user.password, function(err, result) {
        if(result) {
            User.findById(req.body.user._id, function (err, user){
                if (user){
                    console.log( req.body.image);
                    user.image = req.body.image;
                    user.save().then(user => {
                        console.log(user);
                        res.status(200).json({"user" : user});
                    })
                        .catch(err => {
                            res.status(400).json({"message":"unable to update the user"});
                        });
                } else {
                    res.status(404).json({"message": 'user not found'});
                }
            });
        } else {
            res.status(400).json({"message": 'Passwords don\'t match'});
        }
    });
});

// Defined get data(index or listing) route
userRoutes.route('/updateWedding').post(function (req, res) {
    bcrypt.compare(req.body.password, req.body.user.password, function(err, result) {
        if(result) {
            Wedding.findOne({$or: [
                    {partner1: req.body.user},
                    {partner2: req.body.user}
                ]}, function (err, wedding){
                if (!wedding){
                    res.status(404).send({"message":"wedding not found"});
                }  else {
                    wedding.placeName = req.body.placeName;
                    wedding.placeAddress = req.body.placeAddress;
                    wedding.placeType = req.body.placeType;
                    wedding.placeLat = req.body.placeLat;
                    wedding.placeLng = req.body.placeLng;
                    wedding.date = req.body.weddingDate;
                    wedding.save().then(wedding => {
                        res.status(200).json({"wedding" : wedding});
                    })
                        .catch(err => {
                            res.status(400).json({"result":"unable to update the wedding"});
                        });
                }
            });
        } else {
            res.status(400).json({"message": 'Passwords don\'t match'});
        }
    });
});

function updateUserFunction(newEmail,oldEmail,req,res){
    Wedding.findOne({emailPartner:newEmail}, function (err, wedding){
        if (wedding){
            res.status(400).json({"message": 'email already existss'});
        }else {
            User.findOne({email:oldEmail}, function (err, user){
                if (user){
                    user.email = req.body.email;
                    user.firstName = req.body.firstName;
                    user.lastName = req.body.lastName;
                    user.save().then(user => {
                        res.status(200).json({"user" : user});
                    })
                        .catch(err => {
                            res.status(400).json({"message":"unable to update the user"});
                        });
                } else {
                    res.status(400).json({"message": 'No user with this email'});
                }
            });
        }
    });
}

// Defined get data(index or listing) route
userRoutes.route('/updatePassword').post(function (req, res) {
    bcrypt.compare(req.body.oldPassword, req.body.user.password, function(err, result) {
        if(result) {
            bcrypt.compare(req.body.newPassword, req.body.user.password, function(err, result) {
                if(result) {
                    res.status(400).json({"message": 'choose different password'});
                } else {
                    User.findById(req.body.user._id, function (err, user){
                        if (user){
                            let hash = bcrypt.hashSync(req.body.newPassword, 10);
                            user.password = hash;
                            user.save().then(user => {
                                res.status(200).json({"user" : user});
                            })
                                .catch(err => {
                                    res.status(400).json({"message":"unable to update the user"});
                                });
                        } else {
                            res.status(404).json({"message": 'user not found'});                    }
                    });
                }
            });
        } else {
            res.status(400).json({"message": 'Old passwords don\'t match'});
        }
    });
});

// Defined get data(index or listing) route
userRoutes.route('/confirmation').get(function (req, res) {
    // Find a matching token
    Token.findOne({ token: req.query.token }, function (err, token) {
        if (!token) return res.status(400).send('We were unable to find a valid token. Your token my have expired.');
        // If we found a token, find a matching user
        User.findOne({ _id: token._userId}, function (err, user) {
            if (!user) return res.status(400).send('We were unable to find a user for this token.');
            if (user.isVerified) return res.status(400).send('This user has already been verified.');

            // Verify and save the user
            user.isVerified = true;
            user.save(function (err) {
                if (err) { return res.status(500).send({ msg: err.message }); }
                res.status(200).send("The account has been verified. Please log in.");
            });
        });
    });
});

// Defined get data(index or listing) route
userRoutes.route('/resend').post(function (req, res) {
    User.findOne({ email: req.body.email }, function (err, user) {
        if (!user) return res.status(400).json({ 'message': 'We were unable to find a user with that email.' });
        if (user.isVerified) return res.status(400).json({ 'message': 'This account has already been verified. Please log in.' });

        // Create a verification token for this user
        var token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });
        // Save the verification token
        token.save(function (err) {
            if (err) { return res.status(500).json({ 'message': err.message }); }

            // Send the email
            var mailOptions = { from: 'no-reply@wedding-planner.com', to: user.email, subject: 'Account Verification', text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/user/confirmation\/?token=' + token.token + '.\n' };
            transporter.sendMail(mailOptions, function (err) {
                if (err) { return res.status(500).json({ 'message': err.message }); }
                res.status(200).json({'message':'A verification email has been sent to ' + user.email + '.'});
            });
        });
    });
});


function sendToken(user,err,req){
    // Create a verification token for this user
    var token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });
    // Save the verification token
    token.save(function (err) {
        if (err) { return res.status(500).json({ 'message': err.message }); }

        // Send the email
        var mailOptions = { from: 'no-reply@wedding-planner.com', to: user.email, subject: 'Account Verification', text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/user/confirmation\/?token=' + token.token + '.\n' };
        transporter.sendMail(mailOptions, function (err) {
            if (err) { return res.status(500).json({ 'message': err.message }); }
            res.status(200).json({'message':'A verification email has been sent to ' + user.email + '.'});
        });
    });
}

// Defined get data(index or listing) route
userRoutes.route('/updateAlbum').post(function (req, res) {
            Wedding.findById(req.body.wedding._id, function (err, wedding){
                if (wedding){
                    console.log( req.body.images);
                    let array = wedding.album.concat(req.body.images);
                    console.log(array);
                    wedding.album = array;
                    wedding.save().then(wedding => {
                        console.log(wedding);
                        res.status(200).json({"wedding" : wedding});
                    })
                        .catch(err => {
                            res.status(400).json({"message":"unable to update the wedding"});
                        });
                } else {
                    res.status(404).json({"message": 'wedding not found'});                    }
            });
});

// Delete single image
userRoutes.route('/deleteImage').post(function (req, res) {
    Wedding.findById(req.body.wedding._id, function (err, wedding){
        if (wedding){
            for (var i=wedding.album.length-1; i>=0; i--) {
                if (wedding.album[i] === req.body.imageName) {
                    wedding.album.splice(i, 1);
                }
            }
            wedding.save().then(wedding => {
                console.log(req.body.imageName);
                unlink(DIR+'/'+req.body.imageName);
                res.status(200).json({"wedding" : wedding});
            })
                .catch(err => {
                    res.status(400).json({"message":"unable to update the wedding"});
                });
        } else {
            res.status(404).json({"message": 'wedding not found'});                    }
    });
});

module.exports = userRoutes;