const inquirer = require('inquirer');
const state = require('./state');
const responder = require('./responder');

const prompt = inquirer.createPromptModule();

const getQuestions = () => {
    return [ 
        {
            type: 'input',
            name: 'path',
            message: "Where is the project root located ?"
        }
    ];
}

const ask = async (projectName) => {
    const questions = getQuestions();
    const answers = await prompt(questions);
    state.addProject(projectName, answers.path, "fs");
    responder.info(`added project ${projectName} from fs`);
}

module.exports = ask;