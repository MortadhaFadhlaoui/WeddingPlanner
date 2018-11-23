const express = require('express');

const taskRoutes = express.Router();

let Task = require('../models/Task');

taskRoutes.route('/saveTask').post(function (req, res) {
    let task = new Task(req.body);
                    task.save().then(task => {
                        res.status(200).json({"task" : task});
                    })
                        .catch(err => {
                            res.status(400).json({"result":"unable to save the task"});
                        });
                });


taskRoutes.route('/getTasks').get(function (req, res) {
    Task.find({"WeddingID":req.query.WeddingID},function (err, tasks){
        res.status(200).json({"tasks" : tasks});
    });
});

taskRoutes.route('/deleteTask').get(function (req, res) {
    Task.findOneAndDelete({"_id":req.query.taskid}, function (err, tasks){
        res.status(200).json({"message":"deleted"});
    });
});

taskRoutes.route('/UpdateTask').post(function (req, res) {
    let task = new Task(req.body);

    Task.findOneAndUpdate({"_id":req.query.taskid}, function (err, tasks){

    });
        
});

                module.exports = taskRoutes;
