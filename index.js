$(function() {
    var socket = io("http://127.0.0.1:8080");
    var list;
    socket.on("errormessage", function(msg) {
        console.log(msg);
    });
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
        if (data === "=====TASKEND=====") {
            alert("Completed!");
        } else {
            $(".console").append(data);
            $(".console").scrollTop($(".console").prop("scrollHeight") - $(".console").height());
        }
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
    $("#remove").click(function() {
        socket.emit("remove", $("#list").val());
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
    $("#run").click(function() {
        if ($(".console").html("").is(":hidden")) {
            $("#toggleConsole").click();
        }
        var obj = {
            host: $("#host").val(),
            user: $("#user").val(),
            pass: $("#pass").val(),
            command: $("#command").val()
        };
        socket.emit("test", obj);
    });
    $("#toggleConsole").click(function() {
        $(this).text(($(".console").toggle().is(":visible") ? "Hide" : "Show") + "  Console");
    });
});