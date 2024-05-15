import { Texture, Vector2 } from "three"

interface uniforms {
    tDiffuse: {
        value: Texture
    }
    resolution: {
        value: Vector2
    }
}

export class fxaaShaderStrings {
    vertexShader: string
    fragmentShader: string
    uniforms: uniforms

    constructor() {
        this.vertexShader = require("../glsl/fxaaVertexShader.glsl")
        this.fragmentShader = require("../glsl/fxaaFragmentShader.glsl")
        this.uniforms = {
            tDiffuse: { value: null },
            resolution: { value: new Vector2(1 / 1024, 1 / 512) }
        }
    }
}
