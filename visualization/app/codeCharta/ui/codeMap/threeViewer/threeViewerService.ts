"use strict";
import { ThreeSceneService } from "./threeSceneService";
import { ThreeCameraService } from "./threeCameraService";
import { ThreeOrbitControlsService } from "./threeOrbitControlsService";
import { ThreeRendererService } from "./threeRendererService";
import { ThreeUpdateCycleService } from "./threeUpdateCycleService";
import { SettingsService } from "../../../core/settings/settings.service";

/**
 * A service to angularize the Three.js canvas.
 */
export class ThreeViewerService {
    public static SELECTOR = "threeViewerService";

    /* ngInject */
    constructor(
        private threeSceneService: ThreeSceneService,
        private threeCameraService: ThreeCameraService,
        private threeOrbitControlsService: ThreeOrbitControlsService,
        private threeRendererService: ThreeRendererService,
        private threeUpdateCycleService: ThreeUpdateCycleService,
        private settingsService: SettingsService
    ) {}

    /**
     * Initializes the canvas and all necessary services.
     * @param {Object} element DOM Element which should be the canvas
     */
    public init(element: Element) {

        this.threeCameraService.init(
            this.settingsService,
            window.innerWidth,
            window.innerHeight,
            this.settingsService.settings.camera.x,
            this.settingsService.settings.camera.y,
            this.settingsService.settings.camera.z
        );

        this.threeCameraService.camera.lookAt(
            this.threeSceneService.scene.position
        );
        this.threeSceneService.scene.add(this.threeCameraService.camera);

        // create the renderer
        this.threeRendererService.init(window.innerWidth, window.innerHeight);

        // set up the controls with the camera and renderer
        this.threeOrbitControlsService.init(
            this.threeRendererService.renderer.domElement
        );

        // add renderer to DOM
        element.appendChild(this.threeRendererService.renderer.domElement);

        // handles resizing the renderer when the window is resized
        window.addEventListener(
            "resize",
            this.onWindowResize.bind(this),
            false
        );
        window.addEventListener("focusin", this.onFocusIn.bind(this), false);
        window.addEventListener("focusout", this.onFocusOut.bind(this), false);
    }

    /**
     * Applies transformations on window resize.
     */
    public onWindowResize() {
        this.threeSceneService.scene.updateMatrixWorld(false);

        this.threeRendererService.renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );
        this.threeCameraService.camera.aspect =
            window.innerWidth / window.innerHeight;
        this.threeCameraService.camera.updateProjectionMatrix();
    }

    public onFocusIn(event) {
        if(event.target.nodeName == "INPUT") {
            this.threeOrbitControlsService.controls.enableKeys = false;
        }
    }

    public onFocusOut(event) {
        if(event.target.nodeName == "INPUT") {
            this.threeOrbitControlsService.controls.enableKeys = true;
        }
    }

    /**
     * Calls the animation loop.
     */
    public animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.threeRendererService.renderer.render(
            this.threeSceneService.scene,
            this.threeCameraService.camera
        );
        this.threeOrbitControlsService.controls.update();
        this.threeUpdateCycleService.update();
    }
}
