/*eslint no-console: 0, no-unused-vars: 0*/
/*eslint-env node, es6*/
"use strict";

const xsenv = require("@sap/xsenv");
const xssec = require("@sap/xssec");
const hdbext = require("@sap/hdbext");
const logging = require("@sap/logging");
const express = require("express");
const passport = require("passport");

const appContext = logging.createAppContext();

const app = express();

passport.use("JWT", new xssec.JWTStrategy(xsenv.getServices({
	uaa: {
		tag: "xsuaa"
	}
}).uaa));
app.use(logging.expressMiddleware(appContext));
app.use(passport.initialize());

const hanaOptions = xsenv.getServices({
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

const server = require("http").createServer();
const port = process.env.PORT || 3000;
const router = require("./router")(app, server);

server.on("request", app);

server.listen(port, function() {
	console.info("HTTP Server: " + server.address().port);
});
