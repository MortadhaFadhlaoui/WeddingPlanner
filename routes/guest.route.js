const express = require('express');
var crypto = require('crypto');
const guestRoutes = express.Router();

let Guest = require('../models/guest');
let TokenInvit = require('../models/TokenInvit');
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'plannerweeding2@gmail.com',
        pass: 'WeddingPlanner2018'
    }
});

guestRoutes.route('/saveGuest').post(function (req, res) {
    let guest = new Guest(req.body);
    Guest.findOne({Email:req.body.Email}, function (err, gg){
        if (gg){
            res.status(400).send("guest exist already ");
        }
        else {
            guest.save().then(guest => {
                sendToken(guest,res,req);
                res.status(200).send('A confirmation email has been sent to ' + guest.Email + '.');
            })
                .catch(err => {
                    res.status(400).json({"result":"unable to save the guest"});
                });
        }
    });
    });


guestRoutes.route('/getGuests').get(function (req, res) {
    Guest.find({"WeddingID":req.query.WeddingID},function (err, guest){
        res.status(200).json({"guests" : guest});
    });
});

guestRoutes.route('/deleteGuest').get(function (req, res) {
    Guest.findOneAndDelete({"_id":req.query.guestid}, function (err, guest){
        res.status(200).json({"message":"deleted"});
    });
});

guestRoutes.route('/UpdateTask').post(function (req, res) {
    let guest = new guest(req.body);

    Guest.findOneAndUpdate({"_id":req.query.guestid}, function (err, guest){

    });

});

// Defined get data(index or listing) route
guestRoutes.route('/confirmation').get(function (req, res) {
    // Find a matching token
    TokenInvit.findOne({ token: req.query.token }, function (err, token) {
        if (!token) return res.status(400).send('We were unable to find a valid token. Your token my have expired.');
        // If we found a token, find a matching user
        Guest.findOne({ _id: token._guestId}, function (err, guest) {
            if (!guest) return res.status(400).send('We were unable to find a invitation for this token.');
            if (guest.isVerified) return res.status(400).send('This invitation has already been verified.');

            // Verify and save the user
            guest.isVerified = true;
            guest.save(function (err) {
                if (err) { return res.status(500).send({ msg: err.message }); }
                res.status(200).send("Welcome to Wedding <3.");
            });
        });
    });
});

function sendToken(guest,res,req){
    // Create a verification token for this guest
    var token = new TokenInvit({ _guestId: guest._id, token: crypto.randomBytes(16).toString('hex') });
    // Save the verification token
    token.save(function (err) {
        if (err) { return res.status(500).json({ 'message': err.message }); }

        // Send the email
        var mailOptions = {
            from: 'no-reply@wedding-planner.com',
            to: guest.Email,
            subject: 'Join Your friend in his/her weeding day',
            text: 'Hello,\n\n' + req.body.UserName+' invited you to be his Guest 👥 \n\n' +'Please confirm your attend by clicking the link: \nhttp:\/\/' + req.headers.host + '\/guest/confirmation\/?token=' + token.token + '.\n',
            attachments: [{
                filename: 'inv.jpg',
                path: './public/inv.jpg',
            }],
        };
        transporter.sendMail(mailOptions, function (err) {
            if (err) { return res.status(500).json({ 'message': err.message }); }
        });
    });
}

module.exports = guestRoutes;