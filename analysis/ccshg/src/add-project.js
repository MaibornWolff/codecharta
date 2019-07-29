const inquirer = require('inquirer');
const state = require('./state');

const askForGitRepo = require('./add-project-from-git');
const askForFsProject = require('./add-project-from-fs');

const prompt = inquirer.createPromptModule();

const FROM_GIT = "add from git";
const FROM_FS = "add from local file system";

const getQuestions = () => {
    return [ 
        {
            type: 'list',
            name: 'source',
            message: "From where do you want to add the project ?",
            default: FROM_GIT,
            choices: [FROM_GIT, FROM_FS]
        },{
            type: 'input',
            name: 'name',
            message: "What is the name of this project ?",
            default: `project_${state.nextInteger()}`
        }
    ];
}

const ask = async () => {
    const questions = getQuestions();
    const answers = await prompt(questions);
    switch(answers.source) {
        case FROM_GIT: await askForGitRepo(answers.name); break;
        case FROM_FS: await askForFsProject(answers.name); break;
    }
}

module.exports = ask;