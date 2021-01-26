export class CodeMapShaderStrings {
	vertexShaderCode: string
	fragmentShaderCode: string

	constructor() {
		this.vertexShaderCode = require("./shaders/codeMapVertexShader.glsl")
		this.fragmentShaderCode = require("./shaders/codeMapFragmentShader.glsl")
	}
}
