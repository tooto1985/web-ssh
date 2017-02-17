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
var settings = new Settings();
var saveJson = "data/save.json";
var dataJson = "data/data.json";
app.get("/task/:name", function(req, res, next) {
    var data = settings.read(saveJson) || [];
    var task = data[data.indexOf(data.filter(function(a) {
        return a.name === req.params.name;
    })[0])];
    if (task) {
        sshCommand(task.host, task.user, task.pass, task.command, false, function(data) {
            console.log(data);
            res.send(data);
        });
    } else {
        res.send("no task");
    }
});
app.use(express.static("./public"));
io.on("connection", function(socket) {
    socket.emit("list", [null, settings.read(saveJson) || []]);
    socket.emit("data", [null, settings.read(dataJson) || []]);
    socket.on("add", function(obj) {
        var isCommand = obj.command !== undefined;
        var data = settings.read(isCommand ? saveJson : dataJson) || [];
        if (data.filter(function(a) {
                return a.name === obj.name;
            }).length > 0) {
            socket.emit("alert", "Already have the same name.");
        } else {
            data.push(obj);
            settings.write(isCommand ? saveJson : dataJson, data);
            socket.emit(isCommand ? "list" : "data", [obj.name, data]);
        }
    });
    socket.on("save", function(obj) {
        var isCommand = obj.command !== undefined;
        var data = settings.read(isCommand ? saveJson : dataJson) || [];
        data[data.indexOf(data.filter(function(a) {
            return a.name === obj.name;
        })[0])] = obj;
        settings.write(isCommand ? saveJson : dataJson, data);
        socket.emit(isCommand ? "list" : "data", [obj.name, data]);
    });
    socket.on("rename", function(obj) {
        var isCommand = obj.command !== undefined;
        var data = settings.read(isCommand ? saveJson : dataJson) || [];
        if (data.filter(function(a) {
                return a.name === obj.newname;
            }).length > 0) {
            socket.emit("alert", "Already have the same name.");
        } else {
            data[data.indexOf(data.filter(function(a) {
                return a.name === obj.oldname;
            })[0])].name = obj.newname;
            settings.write(isCommand ? saveJson : dataJson, data);
            socket.emit(isCommand ? "list" : "data", [obj.newname, data]);
        }
    });
    socket.on("remove", function(obj) {
        var isCommand = obj.command !== undefined;
        var data = settings.read(isCommand ? saveJson : dataJson) || [];
        data.splice(data.indexOf(data.filter(function(a) {
            return a.name === obj.name;
        })[0]), 1);
        settings.write(isCommand ? saveJson : dataJson, data);
        socket.emit(isCommand ? "list" : "data", [null, data]);
    });
    socket.on("run", function(obj) {
        sshCommand(obj.host, obj.user, obj.pass, obj.command, true, function(data) {
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