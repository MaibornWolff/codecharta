const inquirer = require('inquirer');

const state = require('./state');
const responder = require('./responder');

const askForProject = require("./add-project");
const askForAnalysis = require("./add-analysis");
const askForFilter = require("./add-filter");
const runScript = require("./run-script");

const prompt = inquirer.createPromptModule();

const ADD_PROJECT = "add a new project";
const ADD_ANALYSIS = "add a new analysis";
const ADD_FILTER = "add a new analysis filter";
const GENERATE = "generate script";
const RUN = "run script";
const EXIT = "exit";

const getQuestions = () => {
    const choices = [ADD_PROJECT];
    if(state.hasProjects()) {
        choices.push(ADD_ANALYSIS);
    }
    if(state.hasAnalysis()) {
        choices.push(ADD_FILTER);
        choices.push(GENERATE);
        choices.push(RUN);
    }
    return [ 
        {
            type: 'list',
            name: 'action',
            message: "What do you want to do?",
            default: ADD_PROJECT,
            choices: [...choices, EXIT]
        },
    ];
}

const ask = async () => {
    const questions = getQuestions();
    const answers = await prompt(questions);
    switch(answers.action) {
        case ADD_PROJECT: await askForProject(); break;
        case ADD_ANALYSIS: await askForAnalysis(); break;
        case ADD_FILTER: await askForFilter(); break;
        case GENERATE: responder.code(state.getScript()); break;
        case RUN: await runScript(); break;
        case EXIT: process.exit();
    }
    ask();
}

state.init();
ask();