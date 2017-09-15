export class codeMapShaderStrings {
    constructor()
    {
        /**
         * @type {string}
         */
        this.vertexShaderCode = require('./codeMapVertexShader.glsl');

        /**
         * @type {string}
         */
        this.fragmentShaderCode = require('./codeMapFragmentShader.glsl');
    }
}