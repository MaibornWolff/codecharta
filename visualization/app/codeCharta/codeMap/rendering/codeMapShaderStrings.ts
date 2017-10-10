export class codeMapShaderStrings {

    public vertexShaderCode;
    public fragmentShaderCode;

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