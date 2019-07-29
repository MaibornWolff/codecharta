const inquirer = require('inquirer');

const prompt = inquirer.createPromptModule();

const YES = "yes";
const NO = "no";

const state = require('./state');
const responder = require('./responder');

const questions = [ 
    {
        type: 'input',
        name: 'url',
        message: "Sonar url?",
        default: "http://localhost",
    },
    {
        type: 'input',
        name: 'port',
        message: "Sonar port?",
        default: "9000",
    },
    {
        type: 'input',
        name: 'project_key',
        message: "Sonar project key?",
    },
    {
        type: 'list',
        name: 'merge_modules',
        message: "Should the modules be merged?",
        default: YES,
        choices: [
            YES,
            NO
        ]
    },
    {
        type: 'input',
        name: 'token',
        message: "Use Sonar API token?",
        default: NO,
    },
    {
        type: 'input',
        name: 'metrics',
        message: "Use only specific metrics (comma seperated list)?",
        default: NO,
    }
];

function buildCommand(answers, fileName) {
    let cmd = `ccsh sonarimport ${answers.url}:${answers.port} ${answers.project_key}`;
    
    if(answers.merge_modules === YES) {
        cmd += ` --merge-modules`;
    }

    if(answers.token !== NO) {
        cmd += ` --u ${answers.token}`;
    }
    
    if(answers.metrics !== NO) {
        cmd += ` --m ${answers.metrics}`;
    }
    
    cmd += ` -o ${fileName}`;
    return cmd;
}

const ask = async (project) => {
    const answers = await prompt(questions);
    const fileName = `sonar_${project.name}_${state.nextInteger()}.cc.json`;
    const cmd = buildCommand(answers, fileName);
    state.appendComment(`starting sonar analysis for ${fileName}`)
    state.appendScriptLine(cmd);
    state.addAnalysis(fileName, "sonarimporter", [project]);
    responder.info(`added sonar analysis for project ${project.name}`);
}

module.exports = ask;
