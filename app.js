var port = 8080;
var express = require("express");
var ansiHTML = require("ansi-html");
var sshCommand = require("./modules/sshCommand");
var Settings = require("./modules/Settings");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);
var settings = new Settings("/data/save.json");
app.use(express.static("./"));
io.on("connection", function(socket) {
    var data = settings.read() || [];
    socket.emit("list", [null, data]);
    socket.on("remove", function(name) {
        data.splice(data.indexOf(data.filter(function(a) {
            return a.name === name;
        })[0]),1);
        settings.write(data);
        socket.emit("list", [null, data]);
    });
    socket.on("add", function(obj) {
        data.push(obj);
        settings.write(data);
        socket.emit("list", [obj.name, data]);
    });
    socket.on("test", function(obj) {
        sshCommand(obj.host, obj.user, obj.pass, obj.command, true, function(err, data) {
            if (!err) {
                if (data) {
                    data = data.replace(/</g, "&lt;");
                    data = data.replace(/>/g, "&gt;");
                    data = data.replace(/\n/g, "<br>");
                    data = data.replace(/ /g, "&nbsp;");
                    socket.emit("result", ansiHTML(data));
                }
            } else {
                socket.emit("errormessage", err);
            }
        });
    });
});
server.listen(process.env.PORT || port);