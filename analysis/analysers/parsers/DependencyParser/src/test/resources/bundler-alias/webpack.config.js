const path = require('path')

module.exports = {
    resolve: {
        alias: {
            '@utils': path.resolve(__dirname, 'src/utils')
        }
    }
}
