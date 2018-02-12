/*eslint no-console: 0, no-unused-vars: 0*/
"use strict";

var xsenv = require("@sap/xsenv");
var xssec = require("@sap/xssec");
var hdbext = require("@sap/hdbext");
var logging = require("@sap/logging");
var express = require("express");
var passport = require("passport");

var appContext = logging.createAppContext();

var app = express();

passport.use("JWT", new xssec.JWTStrategy(xsenv.getServices({
	uaa: {
		tag: "xsuaa"
	}
}).uaa));
app.use(logging.expressMiddleware(appContext));
app.use(passport.initialize());

var hanaOptions = xsenv.getServices({
	hana: {
		tag: "hana"
	}
});
app.use(
	passport.authenticate("JWT", {
		session: false
	}),
	hdbext.middleware(hanaOptions.hana)
);

var server = require("http").createServer();
var port = process.env.PORT || 3000;
var router = require("./router")(app, server);

server.on("request", app);

server.listen(port, function() {
	console.info("HTTP Server: " + server.address().port);
});
