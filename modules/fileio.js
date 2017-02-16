var path = require("path");
var fs = require("fs");
fs.writeFile = function(filename, data) {
    try {
        fs.writeFileSync("./" + filename, data);
        return true;
    } catch (e) {
        return false;
    }
};
fs.readFile = function(filename) {
    try {
        var dir = path.dirname(filename);
        if (!fs.existsSync("./" + dir)) {
            fs.mkdirSync("./" + dir);
        }
        return fs.readFileSync("./" + filename).toString();
    } catch (e) {
        return false;
    }
};
module.exports = fs;