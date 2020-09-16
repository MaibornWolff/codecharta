export class CodeMapShaderStrings {
	vertexShaderCode: string
	fragmentShaderCode: string

	constructor() {
		this.vertexShaderCode = require("./codeMapVertexShader.glsl")
		this.fragmentShaderCode = require("./codeMapFragmentShader.glsl")
	}
}
