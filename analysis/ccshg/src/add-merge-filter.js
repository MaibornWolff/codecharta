const inquirer = require('inquirer');
const state = require('./state');
const responder = require('./responder');

const prompt = inquirer.createPromptModule();

const getQuestions = () => {
    return [ 
        {
            type: 'checkbox',
            name: 'analysis',
            message: "Which analysis do you want to merge?",
            choices: state.getAnalysisChoices()
        }
    ];
}

const ask = async () => {
    const questions = getQuestions();
    const answers = await prompt(questions);
    const files = answers.analysis.map(a=>a.file);
    const projects = [].concat.apply([], answers.analysis.map(a=>a.projects));
    const name = projects.map(p=>p.name).join("_");
    const outputFile = `merge_${name}_${state.nextInteger()}.cc.json`;
    state.appendComment(`merge ${files.join("+")}`);
    state.appendScriptLine(`ccsh merge ${files.join(" ")} -o ${outputFile} -p ${name}`);
    state.addAnalysis(outputFile, "merge", projects);
    responder.info(`merged projects ${projects.map(p=>p.name).join(", ")} in ${outputFile}`);
}

module.exports = ask;