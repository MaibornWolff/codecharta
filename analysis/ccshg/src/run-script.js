const state = require('./state');
const responder = require('./responder');
const shell = require('shelljs');

const ask = async () => {

    if (!shell.which('git')) {
      responder.error('Sorry, this script requires git');
    }

    if (!shell.which('java')) {
        responder.error('Sorry, this script requires java');
    }

    if (!shell.which('ccsh')) {
        responder.error('Sorry, this script requires ccsh');
    }

    state.getScript().split("\n").forEach(line=>{
        if(line !== '' && line.charAt(0) !== '#') {
            if(line.startsWith('cd')) {
                shell.cd(line.split(" ")[1]);
            } else  {
                responder.info(`${line}`);
                if (shell.exec(line).code !== 0) {
                    responder.error(`failed`);
                } else {
                    responder.info(`OK`);
                }
            }
        }
    })
}

module.exports = ask;