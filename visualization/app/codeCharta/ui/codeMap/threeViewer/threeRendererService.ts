import * as THREE from "three";
import {WebGLRenderer} from "three";

/**
 * A service which manages the Three.js renderer in an angular way.
 */
export class ThreeRendererService {

    public static SELECTOR = "threeRendererService";

    public static CLEAR_COLOR = 0xeeeedd;

    public static CLEAR_ALPHA = 1;

    public static RENDER_OPTIONS = {
        antialias: true,
        preserveDrawingBuffer: true
    };


    renderer: WebGLRenderer;

    /* @ngInject */
    constructor() {}

    /**
     * Inits the renderer.
     */
    init(containerWidth: number, containerHeight: number){
        this.renderer = new THREE.WebGLRenderer(ThreeRendererService.RENDER_OPTIONS);
        this.renderer.setSize(containerWidth, containerHeight);
        this.renderer.setClearColor(ThreeRendererService.CLEAR_COLOR, ThreeRendererService.CLEAR_ALPHA);
    }

}
