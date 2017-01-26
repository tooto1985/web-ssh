var SSH = require("simple-ssh");
var sshCommand = function(host, user, pass, command, isReal, callback) {
    if (host && user && pass) {
        var ssh = new SSH({
            host: host,
            user: user,
            pass: pass
        });
        ssh.on("error", function(err) {
            callback(err);
        });
        ssh.on("ready", function(err) {
            var log = "";
            var taskEnd = "=====TASKEND=====";
            var todo = function(stdout) {
                if (isReal) {
                    callback(stdout);
                } else {
                    if (stdout.indexOf(taskEnd) > -1) {
                        callback(log.replace(taskEnd, ""));
                    } else {
                        log += stdout;
                    }
                }
            };
            ssh.exec(command + (isReal ? "" : ("\necho " + taskEnd)) + "\nsleep .1", {
                pty: true,
                out: todo,
                err: todo
            });
        });
        ssh.start();
    } else {
        callback("host or user or pass is empty");
    }
}
module.exports = sshCommand;