export class CodeMapShaderStrings {
    vertexShaderCode: string
    fragmentShaderCode: string

    constructor() {
        this.vertexShaderCode = require("../glsl/codeMapVertexShader.glsl")
        this.fragmentShaderCode = require("../glsl/codeMapFragmentShader.glsl")
    }
}
