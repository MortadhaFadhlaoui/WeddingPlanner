const express = require('express');
const bcrypt = require('bcrypt');
const userRoutes = express.Router();
const nodemailer = require('nodemailer');

// nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'mortadha.fadhlaoui@esprit.tn',
        pass: 'mewkhhitdxluqjah'
    }
});



let User = require('../models/User');
let Wedding = require('../models/Wedding');


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

                    user.save()
                        .then(user => {
                            let wedding = new Wedding(req.body);
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
                            res.status(400).send("unable to save user to database");
                        });
                }
                else {
                    res.status(400).send("user already have a partner");
                    console.log("nnn");
                }
            });
        }
    });
});


// Defined login route
userRoutes.route('/login').post(function (req, res) {

    User.findOne({email:req.body.email}, function (err, user){
        console.log(user);
        if (!user){
             res.status(400).json({message: 'No user with this email'});
        }else {
            console.log(user.password);
            bcrypt.compare(req.body.password, user.password, function(err, result) {
                console.log(result);
                if(result) {
                    Wedding.findOne({$or: [
                            {partner1: user},
                            {partner2: user}
                        ]}, function (err, wedding){
                        if (!wedding){
                            res.status(400).send("wedding not found");
                        }  else {
                            res.status(200).json({"user":user,"wedding":wedding});
                        }
                    });
                } else {
                    res.status(400).json({message: 'Passwords don\'t match'});
                }
            });
        }
    });
});


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


module.exports = userRoutes;