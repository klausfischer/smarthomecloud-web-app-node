// load Google Charts libs instantly
google.load('visualization', '1.1', {packages: ['corechart']});


// 
// Chart Controller
// 

var ChartController = function() {};

ChartController.prototype.init = function() {

	var self = this;
	google.setOnLoadCallback(self.drawChart);
	self.rawDataTable = [];
	self.dataTable = new google.visualization.DataTable();
	self.dataTable.addColumn('datetime', 'Timestamp');
	self.dataTable.addColumn('number', 'Temperature in C');
	var now = new Date();
	var twodaysago = new Date().setDate(now.getDate() - 2);
	// Get sensor data from server
	$.ajax({
		url: "http://smarthomecloud-api.azurewebsites.net/api/Value",
		type: "GET",
		dataType: "json"
	}).done(function(sensorEntries) {
		console.log("GET sensor entries successful");
		
		// filter sensordata
		var dataRows = [];
		
		for (var i = 0; i < sensorEntries.length-1; i++) {
			// fake data, when value is 0
			if (sensorEntries[i].value == 0) {
				sensorEntries[i].value = Math.floor((Math.random() * 100) % 30);
			}
			var ar = [new Date(sensorEntries[i].timestamp), sensorEntries[i].value];
			dataRows.push(ar);
		}

		// append sensorEntries to graph
		self.addRows(dataRows);
		self.drawChart();
		//self.createTable("#table1");
		

	}).fail(function(data, textStatus, xhr) {
		console.log("GET sensor entries failed");
		console.log(data);
		console.log(textStatus);
		console.log(xhr);
	});
};
ChartController.prototype.createTable = function(domContainer) {
	var self = this;
	var $tableContainer = $(domContainer);
	var $table = $("<table class='table table-sm table-striped'><thead><tr><th>Timestamp</th><th>Value</th></tr></thead></table>");
	var tmptable = self.rawDataTable.reverse();
	for (var k = 0; k < tmptable.length; k++) {
		$table.append("<tr><td>" + new Date(tmptable[k][0]).toLocaleString() + "</td><td>" + tmptable[k][1] + "</td></tr>");
	};
	$tableContainer.removeAttr("hidden");
	$tableContainer.append($table);
};
ChartController.prototype.drawChart = function() {
	 var options = {
	 	legend: {
	 		position: 'none'
	 	},
	 	theme: 'material',
        title: 'Temperature of Rpi1',
        chartArea: {
        	left: 50,
        	top: 50,
        	width: "90%",
        	height: "80%"
        },
        vAxis: {
        	title: "Temperature in C",
        	viewWindow: {
        		max: 30,
        		min: 0
        	}
        },        
        hAxis : {
        	format: "yyyy-MM-dd \n hh:mm"
        },
        explorer: {
        	actions: ['dragToPan', 'rightClickToReset', 'scrollToZoom'],
        	// keepInBounds: true,
        	axis: 'horizontal'
        },
        width: 600,
        height: 500
      };

      this.chart = new google.visualization.LineChart(document.getElementById('graph1'));
      google.visualization.events.addListener(this.chart, 'ready', this.chartReadyHandler);
      this.chart.draw(this.dataTable, options);
	
};

ChartController.prototype.chartReadyHandler = function() {
	$("#graph1").removeAttr("hidden");	
};

ChartController.prototype.addRows = function(rows) {
	this.rawDataTable = rows;
	this.dataTable.addRows(rows);
};

// 
// Notification Controller
// 

var NotificationController = function() {};

NotificationController.prototype.init = function(notificationDOMContainer, notifLimit, refreshTime) {
	var self = this;
	self.notifs = [];
	self.notifLimit = notifLimit;
	self.notificationDOMContainer = notificationDOMContainer;
	
	self.checkNotifs();
	
	// check for new notifs
	setInterval(function() {
		self.checkNotifs();
	}, refreshTime);	
};

NotificationController.prototype.checkNotifs = function() {
	console.log("checking for new notifs ...");
	var self = this;
	$.ajax({
		url: "http://smarthomecloud-api.azurewebsites.net/api/Event",
		dataType: "json"
	}).done(function(notifications) {
		self.notifs = notifications.slice(notifications.length-self.notifLimit, notifications.length);
		self.showNotifs();
	});
};
NotificationController.prototype.showNotifs = function() {
	var self = this;
	var $container = $(self.notificationDOMContainer);
	$container.empty();


	// add notifications
	$.each(self.notifs, function(key, n) {
		var crDate = new Date(n.timecreated);
		var $singleNotifDOM = $("<li class='alert alert-warning alert-dismissable fade in' role='alert'></li>");
		$singleNotifDOM.append("<button type='button' class='close' data-dismiss='alert'><span>&times;</span>");
		$singleNotifDOM.append("<strong>" + n.message + "</strong>");
		$singleNotifDOM.append("<p>Temperature Peak: " + Math.floor(n.maxtemp) + " °C</br>Average Temperature: " + Math.floor(n.avgtemp) + " °C</p>");
		$singleNotifDOM.append("<small>" + crDate.toLocaleString() + "</small>");
		
		$container.append($singleNotifDOM);
	});
};

// 
// Device Controller
// 


var DeviceController = function (){};

DeviceController.prototype.init = function(devicesDOMtable) {
	this.devicesDOMtable = devicesDOMtable;
	this.getDevices();
};

DeviceController.prototype.getDevices = function() {
	var self = this;
	var url = "http://smarthomecloud-api.azurewebsites.net/api/Device";

	$.ajax({
		url: url,
		type: "GET",
		dataType: "json"
	}).done(function(devices) {
		
		if (devices) {
			self.devices = devices;
		} else {
			console.log("GET devices: no devices received");
		}
		self.listDevices();

	}).fail(function(data, textStatus, xhr) {
		console.log("GET devices failed");
		console.log(data);
		console.log(textStatus);
		console.log(xhr);
	});
};

DeviceController.prototype.listDevices = function() {
	var self = this;

	var $tableContainer = $(self.devicesDOMtable);
	var $table = $("<table class='table table-sm table-striped'><thead><tr><th>Id</th><th>State</th><th>Last Activity Time</th></tr></thead></table>");
	for (var k = 0; k < self.devices.length; k++) {
		$table.append("<tr><td>" + self.devices[k].Id + "</td><td data-connection-state='" + self.devices[k].State + "'>" +  self.devices[k].State + "</td><td>" + new Date(self.devices[k].LastActivityTime).toLocaleString() + "</td></tr>");
	};
	$tableContainer.removeAttr("hidden");
	$tableContainer.append($table);
};



var cc = new ChartController();
var nc = new NotificationController();
var dc = new DeviceController();

$(document).ready(function() {

	cc.init();
	nc.init("#notifications", 5, 10000);
	dc.init("#tableDevices");

	$("alert").alert();


	$(".btn-led").on("click", function(event) {
		var $button = $(event.currentTarget);
		var data = "";
		$button.toggleClass("active");

		if ($button.hasClass("active")) {
			$button.text("On");
			data = {
				"id": "Rpi1",
				"command.action": "#cmd:set_pin;4;1"
			};
		} else {
			$button.text("Off");	
			data = {
				"id": "Rpi1",
				"command.action": "#cmd:set_pin;4;0"
			};
		} 
		
		var url = "http://smarthomecloud-api.azurewebsites.net/api/Device/Rpi1";

		$.ajax({
			url: url,
			type: "POST",
			dataType: "json",
			data: data
		}).done(function(result) {
			console.log(result);
			console.log("Switch LED success");

		}).fail(function(data, textStatus, xhr) {
			console.log("Switch LED fail");
			console.log(data);
			console.log(textStatus);
			console.log(xhr);
		});

	
	});
	
	
	

});