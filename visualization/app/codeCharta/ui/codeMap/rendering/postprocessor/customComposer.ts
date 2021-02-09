import { WebGLInfo, WebGLRenderer, WebGLRenderTarget } from "three"
import { MaskPass, ClearMaskPass } from "three/examples/jsm/postprocessing/MaskPass"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer"
import { Pass } from "three/examples/jsm/postprocessing/Pass"

export class CustomComposer extends EffectComposer {
	private info: WebGLInfo["render"][] = []

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

	render(deltaTime?: number): void {
		if (deltaTime === undefined) {
			deltaTime = this.clock.getDelta()
		}

		const currentRenderTarget = this.renderer.getRenderTarget()
		let maskActive = false
		let pass: Pass

		for (let index = 0; index < this.passes.length; index++) {
			pass = this.passes[index]

			if (pass.enabled === false) continue

			pass.renderToScreen = this.renderToScreen && this.isLastEnabledPass(index) // nosonar
			this.info[index] = { ...this.renderer.info.render }
			pass.render(this.renderer, this.writeBuffer, this.readBuffer, deltaTime, maskActive)

			if (pass.needsSwap) {
				if (maskActive) {
					const context = this.renderer.getContext()
					const stencil = this.renderer.state.buffers.stencil

					stencil.setFunc(context.NOTEQUAL, 1, 0xffffffff)
					this.copyPass.render(this.renderer, this.writeBuffer, this.readBuffer, deltaTime, false)
					stencil.setFunc(context.EQUAL, 1, 0xffffffff)
				}
				this.swapBuffers()
			}

			if (MaskPass !== undefined) {
				if (pass instanceof MaskPass) {
					maskActive = true
				} else if (pass instanceof ClearMaskPass) {
					maskActive = false
				}
			}
		}
		this.renderer.setRenderTarget(currentRenderTarget)
	}

	dispose() {
		let pass: Pass.FullScreenQuad
		for (let index = 0; index < this.passes.length; index++) {
			if (this.passes[index] instanceof Pass.FullScreenQuad) {
				pass.dispose()
			}
		}
	}
}
