var SSH = require("simple-ssh");
function sshCommand(host, user, pass, command, callback) {
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
            ssh.exec(command + "\nsleep .1", {
                pty: true,
                out: function(stdout) {
                    callback(stdout);
                },
                err: function(stdout) {
                    callback(stdout);
                }
            });
        });
        ssh.start();
    } else {
        callback("host or user or pass is empty");
    }
}
module.exports = sshCommand;