const inquirer = require('inquirer');
const state = require('./state');
const responder = require('./responder');

const prompt = inquirer.createPromptModule();

const getQuestions = () => {
    return [ 
        {
            type: 'input',
            name: 'url',
            message: "Which URL should be cloned ?"
        }
    ];
}

const ask = async (projectName) => {
    const questions = getQuestions();
    const answers = await prompt(questions);
    const projectPath = `./${projectName}`;
    state.appendComment(`clone ${projectName} from git`)
    state.appendScriptLine(`git clone ${answers.url} ${projectPath}`);
    state.addProject(projectName, projectPath, "git");
    responder.info(`added project ${projectName} from git`);
}

module.exports = ask;