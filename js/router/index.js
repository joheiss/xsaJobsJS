/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0*/
"use strict";

module.exports = function(app, server) {
	app.use("/js/hana", require("./routes/hana")());
	app.use("/js/jobs", require("./routes/jobs")());
};