/*eslint no-console: 0, no-shadow: 0, new-cap: 0*/
"use strict";

var xsenv = require("@sap/xsenv");
var express = require("express");
var request = require("request");

module.exports = function() {
	var app = express.Router();
	
	// get the full URI of this app
	var app2 = JSON.parse(process.env.VCAP_APPLICATION);
	var appURI = app2.full_application_uris[0];
	
	// get credentials for job scheduler REST API
	var jobOptions = xsenv.getServices({
		jobs: {
			tag: "jobscheduler"
		}
	});
	var jobsURL = jobOptions.jobs.url;
	var jobsAuth = "Basic " + new Buffer(jobOptions.jobs.user + ":" + jobOptions.jobs.password).toString("base64");

	app.get("/create", function(req, res) {
		if (req.authInfo.checkScope("$XSAPPNAME.Admin")) {
			var bodyJSON = {
				"name": "myTask",
				"description": "Perform my task",
				"action": appURI + "/js/hana/insert",
				"active": true,
				"httpMethod": "GET",
				"schedules": [{
					"description": "Perform my task every 15 seconds",
					"cron": "* * * * * * */15",
					"data": {},
					"active": true
				}]
			};
			request({
				url: jobsURL + "/scheduler/jobs",
				method: "POST",
				headers: {
					"Authorization": jobsAuth
				},
				json: true,
				body: bodyJSON
			}, function(err, response, body) {
				if (err) {
					res.status(500).json(body);
				} else {
					res.status(200).json(body);
				}
			});
		} else {
			res.type("text/plain").status(403).send("Forbidden");
		}
	});

	app.get("/delete", function(req, res) {
		if (req.authInfo.checkScope("$XSAPPNAME.Admin")) {
			var jobId = req.query.id;
			if (jobId !== undefined) {
				// need to validate thet jobId contains a valid Job Id !!!
				request({
					url: jobsURL + "/scheduler/jobs/" + jobId,
					method: "DELETE",
					headers: {
						"Authorization": jobsAuth
					},
					json: true
				}, function(err, response, body) {
					if (err) {
						res.status(500).json(body);
					} else {
						res.status(200).json(body);
					}
				});
			} else {
				res.type("text/html").status(200).send("Missing JobId!");
			}
		} else {
			res.type("text/plain").status(403).send("Forbidden");
		}
	});

	return app;
};