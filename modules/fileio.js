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
        return fs.readFileSync("./" + filename).toString();
    } catch (e) {
        return false;
    }
};
module.exports = fs;