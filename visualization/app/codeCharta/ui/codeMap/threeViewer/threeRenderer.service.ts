import { Injectable } from "@angular/core"
import { Camera, Scene, WebGLInfo, WebGLRenderer } from "three"
import { CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js"
import { GlobalSettingsFacade } from "../../../features/globalSettings/facade"
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

    renderer: WebGLRenderer
    labelRenderer: CSS2DRenderer
    scene: Scene
    camera: Camera

    private readonly _afterRender$ = new Subject<void>()
    readonly afterRender$: Observable<void> = this._afterRender$.asObservable()

    private renderScheduled = false

    constructor(private globalSettingsFacade: GlobalSettingsFacade) {}

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
        this.renderer = new WebGLRenderer(this.renderOptions)
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(containerWidth, containerHeight)
        this.renderer.domElement.id = "codeMapScene"

        this.labelRenderer = new CSS2DRenderer()
        this.labelRenderer.setSize(containerWidth, containerHeight)
        this.labelRenderer.domElement.id = "codeMapLabels"
        this.labelRenderer.domElement.style.position = "absolute"
        this.labelRenderer.domElement.style.top = "0"
        this.labelRenderer.domElement.style.left = "0"
        this.labelRenderer.domElement.style.pointerEvents = "none"
        this.labelRenderer.domElement.style.isolation = "isolate"
    }

    getInfo(): WebGLInfo["render"] {
        return this.renderer.info.render
    }

    getMemoryInfo(): WebGLInfo["memory"] {
        return this.renderer.info.memory
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
            const { scene, camera, renderer, labelRenderer } = this
            renderer?.render(scene, camera)
            labelRenderer?.render(scene, camera)
            this._afterRender$.next()
        })
    }
}
