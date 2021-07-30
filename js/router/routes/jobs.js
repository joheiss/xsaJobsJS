/*eslint no-console: 0, no-shadow: 0, new-cap: 0*/
/*eslint-env node, es6*/
"use strict";

const express = require("express");
const xsenv = require("@sap/xsenv");
const jobsc = require("@sap/jobs-client");

module.exports = function () {
	const app = express.Router();

	// setup connection to job scheduler REST API
	const jobOptions = xsenv.getServices({
		jobs: {
			tag: "jobscheduler"
		}
	});
	const schedulerOptions = {
		baseURL: jobOptions.jobs.url,
		user: jobOptions.jobs.user,
		password: jobOptions.jobs.password,
		timeout: 15000
	};
	const scheduler = new jobsc.Scheduler(schedulerOptions);

	app.get("/create", function (req, res) {
		if (req.authInfo.checkScope("$XSAPPNAME.Admin")) {
			// get the full URI of this app
			const thisApp = JSON.parse(process.env.VCAP_APPLICATION);
			const thisAppURI = thisApp.full_application_uris[0];
			const myJob = {
				job: {
					"name": "myJob",
					"description": "Perform my action",
					"action": thisAppURI + "/js/hana/insert",
					"active": true,
					"httpMethod": "POST",
					"schedules": [{
						"description": "Perform my action every 15 seconds",
						"repeatInterval": "15 seconds",
						"data": {},
						"active": true
					}]
				}
			};
			scheduler.createJob(myJob, function (err, body) {
				if (err) {
					res.status(500).json(err);
				} else {
					res.status(200).json(body);
				}
			});
		} else {
			res.type("text/plain").status(403).send("Forbidden");
		}
	});

	app.get("/delete", function (req, res) {
		if (req.authInfo.checkScope("$XSAPPNAME.Admin")) {
			const jobId = req.query.jobId;
			if (jobId !== undefined) {
				const myJob = {
					"jobId": jobId
				};
				scheduler.deleteJob(myJob, function (err, body) {
					if (err) {
						res.status(500).json(err);
					} else {
						res.status(200).json(body);
					}
				});
			} else {
				res.type("text/html").status(200).send("Missing Job Id");
			}
		} else {
			res.type("text/plain").status(403).send("Forbidden");
		}
	});

	return app;
};