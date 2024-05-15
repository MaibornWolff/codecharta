import { WebGLInfo, WebGLRenderer, WebGLRenderTarget } from "three"
import { MaskPass, ClearMaskPass } from "three/examples/jsm/postprocessing/MaskPass"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer"
import { Pass } from "three/examples/jsm/postprocessing/Pass"

export class CustomComposer extends EffectComposer {
    private info: WebGLInfo["render"][] = []
    private memInfo: WebGLInfo["memory"][] = []

    constructor(renderer: WebGLRenderer, renderTarget?: WebGLRenderTarget) {
        super(renderer, renderTarget)
    }

    getInfo(): WebGLInfo["render"] {
        const result: WebGLInfo["render"] = { calls: 0, lines: 0, triangles: 0, points: 0, frame: 0 }

        for (const info of this.info) {
            result.calls += info.calls
            result.lines += info.lines
            result.triangles += info.triangles
            result.points += info.points
        }
        return result
    }

    getMemoryInfo(): WebGLInfo["memory"] {
        const result: WebGLInfo["memory"] = { geometries: 0, textures: 0 }

        for (const info of this.memInfo) {
            result.geometries += info.geometries
            result.textures += info.textures
        }
        return result
    }

    render(deltaTime?: number): void {
        if (deltaTime === undefined) {
            deltaTime = this.clock.getDelta()
        }

        const currentRenderTarget = this.renderer.getRenderTarget()
        let maskActive = false
        let pass: Pass

        for (let index = 0; index < this.passes.length; index++) {
            pass = this.passes[index]

            if (pass.enabled === false) {
                continue
            }

            pass.renderToScreen = this.renderToScreen && this.isLastEnabledPass(index) // nosonar
            this.info[index] = { ...this.renderer.info.render }
            this.memInfo[index] = { ...this.renderer.info.memory }
            pass.render(this.renderer, this.writeBuffer, this.readBuffer, deltaTime, maskActive)

            if (pass.needsSwap) {
                if (maskActive) {
                    const context = this.renderer.getContext()
                    const stencil = this.renderer.state.buffers.stencil

                    stencil.setFunc(context.NOTEQUAL, 1, 0xff_ff_ff_ff)
                    this.copyPass.render(this.renderer, this.writeBuffer, this.readBuffer, deltaTime, false)
                    stencil.setFunc(context.EQUAL, 1, 0xff_ff_ff_ff)
                }
                this.swapBuffers()
            }

            if (pass instanceof MaskPass) {
                maskActive = true
            } else if (pass instanceof ClearMaskPass) {
                maskActive = false
            }
        }
        this.renderer.setRenderTarget(currentRenderTarget)
    }

    dispose() {
        // TODO add more dispose
        for (let index = 0; index < this.passes.length; index++) {
            this.passes[index]["fsQuad"]?.material.dispose()
            this.passes[index]["fsQuad"]?._mesh?.geometry.dispose()
        }
    }
}
