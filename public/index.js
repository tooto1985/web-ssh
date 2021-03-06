$(function() {
    function execute(cmd, params) {
        if (typeof params === "string") {
            params = params.split("\n").reduce(function(p, n) {
                var data = n.split("=");
                var key = data[0];
                var value = data[1];
                p[key] = value;
                return p;
            }, {});
        }
        if (cmd.match(/{{([^\}\}]*)}}/g)) {
            var keys = cmd.match(/{{([^\}\}]*)}}/g).reduce(function(p, n) {
                var data = n.replace(/{{([^\}\}]*)}}/g, "$1").split("=");
                var key = data[0]
                var value = data[1];
                p[n] = params[key] ? params[key] : (value ? value : "");
                return p;
            }, {});
            for (var a in keys) {
                cmd = cmd.replace(new RegExp(a, "g"), keys[a]);
            }
        }
        return cmd;
    }
    var socket = io(location.host);
    var listJson;
    var dataJson;

    function getList(selector, data) {
        var json = data[1];
        $(selector).html("");
        for (var i = 0; i < json.length; i++) {
            $(selector).append("<option>" + json[i].name + "</option>");
        }
        setTimeout(function() {
            if (!data[0]) {
                $(selector).change();
            } else {
                $(selector).val(data[0]).change();
            }
        });
        return json;
    }
    socket.on("list", function(data) {
        listJson = getList("#list", data);
    });
    socket.on("data", function(data) {
        dataJson = getList("#data", data);
    });
    socket.on("result", function(data) {
        $(".console").append(data);
        $(".console").scrollTop($(".console").prop("scrollHeight") - $(".console").height());
    });
    socket.on("alert", function(text) {
        alert(text);
    });

    function getData(selector, json, callback) {
        for (var i = 0; i < json.length; i++) {
            if (json[i].name === $(selector).val()) {
                callback(json[i]);
            }
        }
    }
    $("#list,#data").change(function() {
        var id = $(this).attr("id");
        getData("#" + id, id === "list" ? listJson : dataJson, function(data) {
            if (id === "list") {
                $("#host").val(data.host);
                $("#user").val(data.user);
                $("#pass").val(data.pass);
                $("#command").val(data.command);
            } else {
                $("#parameter").val(data.parameter);
            }

        });
    });
    $("#add,#add2").click(function() {
        var name = prompt("Please enter a name.");
        if (name) {
            var obj;
            if ($(this).attr("id") === "add") {
                obj = {
                    host: $("#host").val(),
                    user: $("#user").val(),
                    pass: $("#pass").val(),
                    name: name,
                    command: $("#command").val()
                };
            } else {
                obj = {
                    name: name,
                    parameter: $("#parameter").val()
                };
            }
            socket.emit("add", obj);
        }
    });
    $("#save,#save2").click(function() {
        var obj;
        if ($(this).attr("id") === "save") {
            obj = {
                host: $("#host").val(),
                user: $("#user").val(),
                pass: $("#pass").val(),
                name: $("#list").val(),
                command: $("#command").val()
            };
        } else {
            obj = {
                name: $("#data").val(),
                parameter: $("#parameter").val()
            };
        }
        socket.emit("save", obj);
    });
    $("#up,#up2,#down,#down2").click(function() {
        var id = $(this).attr("id");
        var obj ={};
        if (id.substr(id.length - 1) === "2") {
            obj.name = $("#data").val();
            if (id === "up2") {
                obj.move = "up";
            } else {
                obj.move = "down";
            }
        } else {
            obj.name = $("#list").val();
            if (id === "up") {
                obj.move = "up";
            } else {
                obj.move = "down";
            }
            obj.command = true;
        }
        socket.emit("move", obj);
    });
    $("#rename,#rename2").click(function() {
        var name = prompt("Please update the name.", $(this).attr("id") === "rename" ? $("#list").val() : $("#data").val());
        if (name) {
            var obj;
            if ($(this).attr("id") === "rename") {
                obj = {
                    oldname: $("#list").val(),
                    newname: name,
                    command: true
                };
            } else {
                obj = {
                    oldname: $("#data").val(),
                    newname: name
                };
            }
            socket.emit("rename", obj);
        }
    });
    $("#remove,#remove2").click(function() {
        var obj;
        if ($(this).attr("id") === "remove") {
            obj = {
                name: $("#list").val(),
                command: true
            };
        } else {
            obj = {
                name: $("#data").val()
            };
        }
        socket.emit("remove", obj);
    });
    $("#run").click(function() {
        if ($(".console").html("").is(":hidden")) {
            $("#toggleConsole").click();
        }
        var obj = {
            host: $("#host").val(),
            user: $("#user").val(),
            pass: $("#pass").val(),
            command: execute($("#command").val(), $("#parameter").val())
        };
        socket.emit("run", obj);
        console.log(obj);
    });
    $("#toggleConsole").click(function() {
        $(this).text(($(".console").toggle().is(":visible") ? "Hide" : "Show") + " Console");
    });
});