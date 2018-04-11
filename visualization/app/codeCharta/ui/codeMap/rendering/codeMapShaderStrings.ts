declare function require(name:string): string;

export class codeMapShaderStrings {

    public vertexShaderCode: string;
    public fragmentShaderCode: string;

    constructor() {
        this.vertexShaderCode = require("./codeMapVertexShader.glsl");
        this.fragmentShaderCode = require("./codeMapFragmentShader.glsl");
    }
}