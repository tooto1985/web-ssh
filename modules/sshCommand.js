var SSH = require("simple-ssh");
function sshCommand(host, user, pass, command, isReal, callback) {
    if (!host || !user || !pass) {
        callback("host or user or pass is empty");
        return;
    }
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
        ssh.exec(command + "\necho " + taskEnd, {
            pty: true,
            out: function(stdout) {
                if (!isReal) {
                    if (stdout.indexOf(taskEnd) > -1) {
                        callback(null, log.replace(taskEnd, ""));
                    } else {
                        log += stdout;
                    }
                } else {
                    callback(null, stdout);
                }
            }
        });
    });
    ssh.start();
}
module.exports = sshCommand;