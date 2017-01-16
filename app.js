var port = 8081;
var express = require("express");
var ansiHTML = require("ansi-html");
var Convert = require('ansi-to-html');
var convert = new Convert();
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
    socket.on("add", function(obj) {
        if (data.filter(function(a) {
                return a.name === obj.name;
            }).length > 0) {
            socket.emit("alert", "Already have the same name.");
        } else {
            data.push(obj);
            settings.write(data);
            socket.emit("list", [obj.name, data]);
        }
    });
    socket.on("save", function(obj) {
        data[data.indexOf(data.filter(function(a) {
            return a.name === obj.name;
        })[0])] = obj;
        settings.write(data);
        socket.emit("list", [obj.name, data]);
    });
    socket.on("rename", function(obj) {
        if (data.filter(function(a) {
                return a.name === obj.newname;
            }).length > 0) {
            socket.emit("alert", "Already have the same name.");
        } else {
            data[data.indexOf(data.filter(function(a) {
                return a.name === obj.oldname;
            })[0])].name = obj.newname;
            settings.write(data);
            socket.emit("list", [obj.newname, data]);
        }
    });
    socket.on("remove", function(name) {
        data.splice(data.indexOf(data.filter(function(a) {
            return a.name === name;
        })[0]), 1);
        settings.write(data);
        socket.emit("list", [null, data]);
    });
    socket.on("run", function(obj) {
        sshCommand(obj.host, obj.user, obj.pass, obj.command, function(data) {
            if (typeof data === "string") {
                data = data.replace(/</g, "&lt;");
                data = data.replace(/>/g, "&gt;");
                data = data.replace(/\n/g, "<br>");
                data = data.replace(/ /g, "&nbsp;");
                data = ansiHTML(convert.toHtml(data));
            } else if (typeof data === "object") {
                data = data.toString();
            }
            socket.emit("result", data);
        });
    });
});
server.listen(process.env.PORT || port);