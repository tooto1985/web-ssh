var SSH2Shell = require("ssh2shell");
function sshCommand(host, user, pass, command, callback) {
    if (host && user && pass) {
        var ssh = new SSH2Shell({
            server: {
                host: host,
                userName: user,
                password: pass
            },
            commands: command.split("\n"),
            asciiFilter: "asciiFilter",
            textColorFilter: "textColorFilter",
            idleTimeOut: 60000,
            onCommandProcessing: function(command, response, sshObj) {
                callback(response);    
            },
            onError: function(err) {
                callback(err);
            }       
        });
        ssh.connect();
    } else {
        callback("host or user or pass is empty");
    }
}
module.exports = sshCommand;