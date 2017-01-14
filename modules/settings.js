var fileio = require("./fileio");
function Settings(savepath) {
    this.savepath = savepath;
}
Settings.prototype.read = function() {
    return JSON.parse(fileio.readFile(this.savepath));
};
Settings.prototype.write = function(json) {
    return fileio.writeFile(this.savepath, JSON.stringify(json, null, "\t"));
};
module.exports = Settings;