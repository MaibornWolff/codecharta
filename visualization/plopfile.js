const promptDirectory = require('inquirer-directory');
const promptFile = require('inquirer-file');

const appBase = "app";

module.exports = function (plop) {

    plop.setPrompt('directory', promptDirectory);
    plop.setPrompt('file', promptFile);

    plop.setGenerator('core module with empty service', {
        description: 'a core module with an empty service for business logic with all necessary files and tests',
        prompts: [
          {
              type: 'input',
              name: 'name',
              message: 'Name?'
          }
        ],
        actions: [
                buildAddAction(["{{camelCase name}}", "service", "ts"], 'codeCharta/core/{{camelCase name}}'),
                buildAddAction(["{{camelCase name}}", "service", "spec", "ts"], 'codeCharta/core/{{camelCase name}}'),
                buildAddAction(["{{camelCase name}}", "module", "ts"], 'codeCharta/core/{{camelCase name}}', "core"),
                {
                    type: 'modify',
                    path: 'app/codeCharta/core/core.module.ts',
                    pattern: /(\/\/ Plop: Append component name here)/gi,
                    template: '$1\r\n\t\t\"app.codeCharta.core.{{camelCase name}}\",'
                },
                {
                    type: 'modify',
                    path: 'app/codeCharta/core/core.module.ts',
                    pattern: /(\/\/ Plop: Append module import here)/gi,
                    template: '$1\r\nimport "./{{camelCase name}}/{{camelCase name}}.module\";'
                }]
    });

   plop.setGenerator('ui module with empty component', {
      description: 'an ui module with an empty component, all necessary files and tests',
      prompts: [
        {
            type: 'input',
            name: 'name',
            message: 'Name?'
        }
      ],
      actions: [
            buildAddAction(["{{camelCase name}}", "component", "ts"], 'codeCharta/ui/{{camelCase name}}'),
            buildAddAction(["{{camelCase name}}", "module", "ts"], 'codeCharta/ui/{{camelCase name}}', "ui"),
            buildAddAction(["{{camelCase name}}", "component", "html"], 'codeCharta/ui/{{camelCase name}}'),
            buildAddAction(["{{camelCase name}}", "component", "scss"], 'codeCharta/ui/{{camelCase name}}'),
            buildAddAction(["{{camelCase name}}", "e2e", "ts"], 'codeCharta/ui/{{camelCase name}}'),
            buildAddAction(["{{camelCase name}}", "component", "spec", "ts"], 'codeCharta/ui/{{camelCase name}}'),
            {
                type: 'modify',
                path: 'app/codeCharta/ui/ui.ts',
                pattern: /(\/\/ Plop: Append component name here)/gi,
                template: '$1\r\n\t\t\"app.codeCharta.ui.{{camelCase name}}\",'
            },
            {
                type: 'modify',
                path: 'app/codeCharta/ui/ui.ts',
                pattern: /(\/\/ Plop: Append module import here)/gi,
                template: '$1\r\nimport "./{{camelCase name}}/{{camelCase name}}.module.ts\";'
			}]
    });
  
  };

function buildAddAction(suffixTokens = ["{{camelCase name}}", "ts"], dir = '{{directory}}', templatePrefix = null) {
    let templateNameSuffixTokens = suffixTokens;
    if(templatePrefix) {
        templateNameSuffixTokens = templateNameSuffixTokens.slice(1);
        templateNameSuffixTokens = ["", templatePrefix].concat(templateNameSuffixTokens);
    }
    return {
        type: 'add',
        path: appBase + '/'+dir+'/' + suffixTokens.join("."),
        templateFile: 'plop-templates/'+ templateNameSuffixTokens.slice(1).join(".") + '.hbs',
    };
}