var fileio = require("./fileio");
var Settings = function() {};
Settings.prototype.read = function(path) {
	return JSON.parse(fileio.readFile(path));
};
Settings.prototype.write = function(path, json) {
	return fileio.writeFile(path, JSON.stringify(json, null, "\t"));
};
module.exports = Settings;