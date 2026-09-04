import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { BehaviorSubject, Observable, Subject } from "rxjs"
import { Camera, Scene, WebGLInfo, WebGLRenderer } from "three"
import { CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js"
import { CcState } from "../../model/codeCharta.model"
import { isWhiteBackgroundSelector } from "../../stores/mapState/mapState.read.facade"

@Injectable({ providedIn: "root" })
export class ThreeRendererService {
    static BACKGROUND_COLOR = {
        white: 0xff_ff_ff,
        normal: 0xf4_f4_eb
    }

    static CLEAR_ALPHA = 1

    /** A phone reports a device pixel ratio of 3 and, lacking a viewport meta tag, a ~980px layout
     * viewport, so its raw ratio asks for a ~15 megapixel buffer — antialiasing then quadruples the
     * colour and depth storage of it, and the mobile GPU drops the context. Both caps together keep
     * the buffer affordable there while leaving a normal desktop viewport at its native ratio. */
    static readonly MAX_PIXEL_RATIO = 2
    static readonly MAX_DRAWING_BUFFER_PIXELS = 4_000_000

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

    private readonly _isContextLost$ = new BehaviorSubject(false)
    readonly isContextLost$: Observable<boolean> = this._isContextLost$.asObservable()

    private renderScheduled = false

    constructor(private readonly store: Store<CcState>) {}

    init(containerWidth: number, containerHeight: number, scene: Scene, camera: Camera) {
        this.scene = scene
        this.camera = camera
        this.initGL(containerWidth, containerHeight)
        this.store.select(isWhiteBackgroundSelector).subscribe(isWhiteBackground => this.setBackgroundColorToState(isWhiteBackground))
    }

    private setBackgroundColorToState(isWhiteBackground: boolean) {
        this.clearColor = isWhiteBackground ? ThreeRendererService.BACKGROUND_COLOR.white : ThreeRendererService.BACKGROUND_COLOR.normal
        this.renderer?.setClearColor(this.clearColor, ThreeRendererService.CLEAR_ALPHA)
    }

    private initGL(containerWidth: number, containerHeight: number) {
        this.renderer = new WebGLRenderer(this.renderOptions)
        this.renderer.setPixelRatio(this.budgetedPixelRatio(containerWidth, containerHeight))
        this.renderer.setSize(containerWidth, containerHeight)
        this.renderer.domElement.id = "codeMapScene"
        this.renderer.domElement.addEventListener("webglcontextlost", this.onContextLost)
        this.renderer.domElement.addEventListener("webglcontextrestored", this.onContextRestored)

        this.labelRenderer = new CSS2DRenderer()
        this.labelRenderer.setSize(containerWidth, containerHeight)
        this.labelRenderer.domElement.id = "codeMapLabels"
        this.labelRenderer.domElement.style.position = "absolute"
        this.labelRenderer.domElement.style.top = "0"
        this.labelRenderer.domElement.style.left = "0"
        this.labelRenderer.domElement.style.pointerEvents = "none"
        this.labelRenderer.domElement.style.isolation = "isolate"
    }

    setSize(width: number, height: number) {
        this.renderer.setPixelRatio(this.budgetedPixelRatio(width, height))
        this.renderer.setSize(width, height)
        this.labelRenderer.setSize(width, height)
    }

    private budgetedPixelRatio(width: number, height: number) {
        const areaBudget = Math.sqrt(ThreeRendererService.MAX_DRAWING_BUFFER_PIXELS / (width * height))
        return Math.max(1, Math.min(window.devicePixelRatio, ThreeRendererService.MAX_PIXEL_RATIO, areaBudget))
    }

    private readonly onContextLost = (event: Event) => {
        // Only a prevented default makes the browser attempt a restore.
        event.preventDefault()
        this._isContextLost$.next(true)
    }

    private readonly onContextRestored = () => {
        this._isContextLost$.next(false)
        this.render()
    }

    destroy() {
        this.renderer?.domElement.removeEventListener("webglcontextlost", this.onContextLost)
        this.renderer?.domElement.removeEventListener("webglcontextrestored", this.onContextRestored)
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
