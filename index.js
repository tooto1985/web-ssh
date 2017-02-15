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
        var keys = cmd.match(/{{([0-9a-zA-Z=]*)}}/g).reduce(function(p, n) {
            var data = n.replace(/{{([0-9a-zA-Z=]*)}}/g, "$1").split("=");
            var key = data[0]
            var value = data[1];
            p[n] = params[key] ? params[key] : (value ? value : "");
            return p;
        }, {});
        for (var a in keys) {
            cmd = cmd.replace(new RegExp(a, "g"), keys[a]);
        }
        return cmd;
    }

    var socket = io(location.host);
    var list;
    socket.on("list", function(data) {
        list = data[1];
        $("#list").html("");
        for (var i = 0; i < list.length; i++) {
            $("#list").append("<option>" + list[i].name + "</option>");
        }
        if (!data[0]) {
            $("#list").change();
        } else {
            $("#list").val(data[0]).change();
        }
    });
    socket.on("result", function(data) {
        $(".console").append(data);
        $(".console").scrollTop($(".console").prop("scrollHeight") - $(".console").height());
    });
    socket.on("alert", function(text) {
        alert(text);
    });
    $("#list").change(function() {
        for (var i = 0; i < list.length; i++) {
            if (list[i].name === $("#list").val()) {
                $("#host").val(list[i].host);
                $("#user").val(list[i].user);
                $("#pass").val(list[i].pass);
                $("#command").val(list[i].command);
            }
        }
    });
    $("#add").click(function() {
        var name = prompt("Please enter a name.");
        if (name) {
            var obj = {
                host: $("#host").val(),
                user: $("#user").val(),
                pass: $("#pass").val(),
                name: name,
                command: $("#command").val()
            };
            socket.emit("add", obj);
        }
    });
    $("#save").click(function() {
        var obj = {
            host: $("#host").val(),
            user: $("#user").val(),
            pass: $("#pass").val(),
            name: $("#list").val(),
            command: $("#command").val()
        };
        socket.emit("save", obj);
    });
    $("#rename").click(function() {
        var name = prompt("Please update the name.", $("#list").val());
        if (name) {
            socket.emit("rename", {
                oldname: $("#list").val(),
                newname: name
            });
        }
    });
    $("#remove").click(function() {
        socket.emit("remove", $("#list").val());
    });
    $("#run").click(function() {
        if ($(".console").html("").is(":hidden")) {
            $("#toggleConsole").click();
        }
        var obj = {
            host: $("#host").val(),
            user: $("#user").val(),
            pass: $("#pass").val(),
            command: execute($("#command").val(),$("#parameter").val())
        };
        socket.emit("run", obj);
    });
    $("#toggleConsole").click(function() {
        $(this).text(($(".console").toggle().is(":visible") ? "Hide" : "Show") + " Console");
    });
});