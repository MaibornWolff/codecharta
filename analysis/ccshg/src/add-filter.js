const inquirer = require('inquirer');

const askForMergeFilter = require('./add-merge-filter');

const prompt = inquirer.createPromptModule();

const MERGE = "merge multiple analysis";

const getQuestions = () => {
    return [ 
        {
            type: 'list',
            name: 'filter',
            message: "What kind of filter do you want to add?",
            default: MERGE,
            choices: [MERGE]
        }
    ];
}

const ask = async () => {
    const questions = getQuestions();
    const answers = await prompt(questions);
    switch(answers.filter) {
        case MERGE: await askForMergeFilter(); break;
    }
}

module.exports = ask;