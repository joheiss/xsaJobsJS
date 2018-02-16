/*eslint no-console: 0, no-shadow: 0, new-cap: 0, quotes: 0*/
"use strict";

var express = require("express");

module.exports = function() {
	var app = express.Router();

	app.get("/select", function(req, res) {
		if (req.authInfo.checkScope("$XSAPPNAME.Viewer")) {
			var sql = 'SELECT "id", "created" FROM "xsaJobsJS.db::tables.MyTable"';
			req.db.prepare(sql, function(err, statement) {
				if (err) {
					res.type("text/plain").status(500).send("ERROR: " + err.toString());
					return;
				}
				statement.exec([], function(err, results) {
					if (err) {
						res.type("text/plain").status(500).send("ERROR: " + err.toString());
					} else {
						res.status(200).json(results);
					}
				});
			});
		} else {
			res.type("text/plain").status(403).send("Forbidden");
		}
	});

	app.post("/insert", function(req, res) {
		if (req.authInfo.checkScope("$XSAPPNAME.Admin") || req.authInfo.checkScope("$XSAPPNAME.JobScheduler")) {
			var sql = 'INSERT INTO "xsaJobsJS.db::tables.MyTable" ("created") VALUES(?)';
			var ts = new Date().toISOString();
			req.db.prepare(sql, function(err, statement) {
				if (err) {
					res.type("text/plain").status(500).send("ERROR: " + err.toString());
					return;
				}
				statement.exec([ts], function(err, results) {
					if (err) {
						res.type("text/plain").status(500).send("ERROR: " + err.toString());
					} else {
						console.log("hana.js:insert: ", ts);
						res.status(200).json(results);
					}
				});
			});
		} else {
			res.type("text/plain").status(403).send("Forbidden");
		}
	});

	return app;
};