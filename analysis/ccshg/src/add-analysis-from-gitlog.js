const state = require('./state');
const responder = require('./responder');

const ask = async (project) => {
    const outputFile = `gitlog_${state.nextInteger()}_${project.name}.cc.json`;
    state.appendComment(`scmlogparser @ ${project.name}`);
    state.appendScriptLine(`cd ${project.path}`);
    state.appendScriptLine(`git log --numstat --raw --topo-order > git.log`);
    state.appendScriptLine(`cd ..`);
    state.appendScriptLine(`ccsh scmlogparser ${project.path}/git.log --input-format GIT_LOG_NUMSTAT_RAW -o ${outputFile}`);
    state.addAnalysis(outputFile, "scmlogparser", [project]);
    responder.info(`added Gitlog analysis for project ${project.name}`);
}

module.exports = ask;
