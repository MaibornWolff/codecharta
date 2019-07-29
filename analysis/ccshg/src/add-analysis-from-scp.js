const state = require('./state');
const responder = require('./responder');

const ask = async (project) => {
    const outputFile = `scp_${state.nextInteger()}_${project.name}.cc.json`;
    state.appendComment(`sourcecodeparser @ ${project.name}`);
    state.appendScriptLine(`ccsh sourcecodeparser ${project.path} -o ${outputFile}`);
    state.addAnalysis(outputFile, "sorcecodeparser", [project]);
    responder.info(`added SCP analysis for project ${project.name}`);
}

module.exports = ask;