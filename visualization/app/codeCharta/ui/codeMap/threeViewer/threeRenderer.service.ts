import { Injectable } from "@angular/core"
import { Camera, RGBAFormat, Scene, Vector2, WebGLInfo, WebGLRenderer, WebGLRenderTarget } from "three"
import { CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js"
import { RenderPass } from "three/addons/postprocessing/RenderPass.js"
import WEBGL from "three/addons/capabilities/WebGL.js"
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js"
import { CustomComposer } from "../rendering/postprocessor/customComposer"
import { GlobalSettingsFacade } from "../../../features/globalSettings/facade"
import { SharpnessMode, CcState } from "../../../codeCharta.model"
import { fxaaShaderStrings } from "../rendering/shaders/loaders/fxaaShaderStrings"
import { Store, State } from "@ngrx/store"
import { Observable, Subject } from "rxjs"

@Injectable({ providedIn: "root" })
export class ThreeRendererService {
    static BACKGROUND_COLOR = {
        white: 0xff_ff_ff,
        normal: 0xf4_f4_eb
    }

    static CLEAR_ALPHA = 1

    clearColor = ThreeRendererService.BACKGROUND_COLOR.normal

    renderOptions: WebGLContextAttributes = {
        antialias: true,
        preserveDrawingBuffer: true,
        alpha: true
    }

    enableFXAA = false
    setPixelRatio = false

    composer: CustomComposer
    renderer: WebGLRenderer
    labelRenderer: CSS2DRenderer
    scene: Scene
    camera: Camera

    private readonly _afterRender$ = new Subject<void>()
    readonly afterRender$: Observable<void> = this._afterRender$.asObservable()

    private renderScheduled = false

    constructor(
        private store: Store<CcState>,
        private state: State<CcState>,
        private globalSettingsFacade: GlobalSettingsFacade
    ) {}

    init(containerWidth: number, containerHeight: number, scene: Scene, camera: Camera) {
        this.scene = scene
        this.camera = camera
        this.initGL(containerWidth, containerHeight)
        this.globalSettingsFacade.isWhiteBackground$().subscribe(isWhiteBackground => this.setBackgroundColorToState(isWhiteBackground))
    }

    private setBackgroundColorToState(isWhiteBackground: boolean) {
        this.clearColor = isWhiteBackground ? ThreeRendererService.BACKGROUND_COLOR.white : ThreeRendererService.BACKGROUND_COLOR.normal
        this.renderer?.setClearColor(this.clearColor, ThreeRendererService.CLEAR_ALPHA)
    }

    private initGL(containerWidth: number, containerHeight: number) {
        this.setGLOptions()
        this.renderer = new WebGLRenderer(this.renderOptions)
        if (this.setPixelRatio) {
            this.renderer.setPixelRatio(window.devicePixelRatio)
        }
        if (this.enableFXAA) {
            if (WEBGL.isWebGL2Available) {
                const size = this.renderer.getDrawingBufferSize(new Vector2())
                const renderTarget = new WebGLRenderTarget(size.width, size.height, {
                    format: RGBAFormat
                })
                this.composer = new CustomComposer(this.renderer, renderTarget)
            } else {
                this.composer = new CustomComposer(this.renderer)
            }
        }
        this.renderer.setSize(containerWidth, containerHeight)
        this.renderer.domElement.id = "codeMapScene"

        this.labelRenderer = new CSS2DRenderer()
        this.labelRenderer.setSize(containerWidth, containerHeight)
        this.labelRenderer.domElement.id = "codeMapLabels"
        this.labelRenderer.domElement.style.position = "absolute"
        this.labelRenderer.domElement.style.top = "0"
        this.labelRenderer.domElement.style.left = "0"
        this.labelRenderer.domElement.style.pointerEvents = "none"

        if (this.enableFXAA) {
            this.initComposer()
        }
    }

    private setGLOptions() {
        switch (this.state.getValue().appSettings.sharpnessMode) {
            case SharpnessMode.Standard:
                this.renderOptions.antialias = true
                this.enableFXAA = false
                this.setPixelRatio = false
                break
            case SharpnessMode.PixelRatioNoAA:
                this.renderOptions.antialias = false
                this.enableFXAA = false
                this.setPixelRatio = true
                break
            case SharpnessMode.PixelRatioFXAA:
                this.renderOptions.antialias = false
                this.enableFXAA = true
                this.setPixelRatio = true
                break
            case SharpnessMode.PixelRatioAA:
                this.renderOptions.antialias = true
                this.enableFXAA = false
                this.setPixelRatio = true
                break
        }
    }

    private initComposer() {
        const pixelRatio = this.renderer.getPixelRatio()

        this.composer.setSize(window.innerWidth * pixelRatio, window.innerHeight * pixelRatio)
        const renderPass = new RenderPass(this.scene, this.camera)
        this.composer.addPass(renderPass)

        const effectFXAA = new ShaderPass(new fxaaShaderStrings())
        effectFXAA.renderToScreen = false
        effectFXAA.uniforms["resolution"].value.x = 1 / (window.innerWidth * pixelRatio)
        effectFXAA.uniforms["resolution"].value.y = 1 / (window.innerHeight * pixelRatio)
        this.composer.addPass(effectFXAA)
    }

    getInfo(): WebGLInfo["render"] {
        return this.enableFXAA ? this.composer.getInfo() : this.renderer.info.render
    }

    getMemoryInfo(): WebGLInfo["memory"] {
        return this.enableFXAA ? this.composer.getMemoryInfo() : this.renderer.info.memory
    }

    render() {
        // Intentional debouncing: if a render is already queued for the next animation frame,
        // subsequent calls within the same frame are dropped. This is by design — callers do
        // not need to coordinate; the single scheduled frame captures the latest state.
        if (this.renderScheduled) {
            return
        }
        this.renderScheduled = true
        requestAnimationFrame(() => {
            this.renderScheduled = false
            const { scene, camera, composer, renderer, labelRenderer } = this
            if (this.enableFXAA) {
                composer?.render()
            } else {
                renderer?.render(scene, camera)
            }
            labelRenderer?.render(scene, camera)
            this._afterRender$.next()
        })
    }
}
