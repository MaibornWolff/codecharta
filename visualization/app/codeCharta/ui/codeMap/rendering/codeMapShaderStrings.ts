export class CodeMapShaderStrings {
	public vertexShaderCode: string
	public fragmentShaderCode: string

	constructor() {
		this.vertexShaderCode = require("./codeMapVertexShader.glsl")
		this.fragmentShaderCode = require("./codeMapFragmentShader.glsl")
	}
}
