const inquirer = require('inquirer');
const state = require('./state');

const askForScpAnalysis = require('./add-analysis-from-scp');
const askForGitlogAnalysis = require('./add-analysis-from-gitlog');
const askForSonarAnalysis = require('./add-analysis-from-sonar');

const prompt = inquirer.createPromptModule();

const FROM_SCP = "analyze java project with sourcecode parser";
const FROM_GITLOG = "analyze git log";
const FROM_SONAR = "analyze with Sonarqube";

const getQuestions = () => {
    return [ 
        {
            type: 'list',
            name: 'importer',
            message: "What kind of analysis do you want to add?",
            default: FROM_SCP,
            choices: [FROM_SCP, FROM_GITLOG, FROM_SONAR]
        },{
            type: 'list',
            name: 'project',
            message: "Which project do you want to analyze?",
            choices: state.getProjectChoices()
        }
    ];
}

const ask = async () => {
    const questions = getQuestions();
    const answers = await prompt(questions);
    switch(answers.importer) {
        case FROM_SCP: await askForScpAnalysis(answers.project); break;
        case FROM_GITLOG: await askForGitlogAnalysis(answers.project); break;
        case FROM_SONAR: await askForSonarAnalysis(answers.project); break;
    }
}

module.exports = ask;