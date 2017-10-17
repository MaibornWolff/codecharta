// this file can stay js. no context problems with webpack and jasmine
const context = require.context('./codeCharta', true, /\.(ts|tsx)$/);
context.keys().forEach(context);