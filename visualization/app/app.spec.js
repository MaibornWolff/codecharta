const context = require.context('./codeCharta', true, /\.(js|ts|tsx)$/);
context.keys().forEach(context);