var express = require('express');
var app = express();
var router = express.Router();
var nconf = require('nconf');

var azure = require('azure-storage');
var async = require('async');
var Task = require('../models/task');

function init() {
	this.task = new Task(azure.createTableService(nconf.get('STORAGE_NAME'), nconf.get('STORAGE_KEY')), nconf.get('TABLE_NAME'), nconf.get('PARTITION_KEY'));
}

init();

router.get('/', function(req, res) {
	var self = this;
	var query = new azure.TableQuery()
	.where('completed eq ?', false);
	self.task.find(query, function itemsFound(error, items) {
		if(error) {
			throw error;
		}
		res.render('tasks',{title: 'My Tasks ', tasks: items, activeItem: 'tasks'});
	});
});

router.post('/addtask', function(req,res) {
	var self = this;
	console.log(req.body);

	var item = {
		name: req.body.itemName,
		category: req.body.itemCategory
	};
	self.task.addItem(item, function itemAdded(error) {
		if(error) {
			throw error;
		}
		res.redirect('/tasks');
	});
});

router.post('/completeTask', function(req,res) {
	var self = this;
	var completedTasks = Object.keys(req.body);
	async.forEach(completedTasks, function taskIterator(completedTask, callback) {
		self.task.updateItem(completedTask, function itemsUpdated(error) {
			if(error){
				callback(error);
			} else {
				callback(null);
			}
		});
	}, function goHome(error){
		if(error) {
			throw error;
		} else {
			res.redirect('/tasks');
		}
	});
});


module.exports = router;