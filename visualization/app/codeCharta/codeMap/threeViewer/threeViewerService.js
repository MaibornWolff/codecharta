"use strict";

/**
 * A service to angularize the Three.js canvas.
 */
class ThreeViewerService {

    /* ngInject */

    /**
     * @constructor
     * @param {ThreeSceneService} threeSceneService
     * @param {ThreeCameraService} threeCameraService
     * @param {ThreeOrbitControlsService} threeOrbitControlsService
     * @param {ThreeRendererService} threeRendererService
     * @param {ThreeUpdateCycleService} threeUpdateCycleService
     * @param {SettingsService} settingsService
     */
    constructor(threeSceneService, threeCameraService, threeOrbitControlsService, threeRendererService, threeUpdateCycleService, settingsService) {
        /**
         * @type {ThreeSceneService}
         */
        this.SceneService = threeSceneService;

        /**
         * @type {ThreeCameraService}
         */
        this.CameraService = threeCameraService;

        /**
         * @type {ThreeOrbitControlsService}
         */
        this.OrbitControlsService = threeOrbitControlsService;

        /**
         * @type {ThreeRendererService}
         */
        this.RendererService = threeRendererService;

        /**
         * @type {ThreeUpdateCycleService}
         */
        this.UpdateCycleService = threeUpdateCycleService;

        /**
         * @type {SettingsService}
         */
        this.settingsService = settingsService;
    }

    /**
     * Initializes the canvas and all necessary services.
     * @param {Object} element DOM Element which should be the canvas
     */
    init(element) {
        this.CameraService.init(window.innerWidth, window.innerHeight, this.settingsService.settings.camera.x, this.settingsService.settings.camera.y, this.settingsService.settings.camera.z);

        this.CameraService.camera.lookAt(this.SceneService.scene.position);
        this.SceneService.scene.add(this.CameraService.camera);

        // create the renderer
        this.RendererService.init(window.innerWidth, window.innerHeight);

        // set up the controls with the camera and renderer
        this.OrbitControlsService.init(this.RendererService.renderer.domElement);

        // add renderer to DOM
        element.appendChild(this.RendererService.renderer.domElement);

        // handles resizing the renderer when the window is resized
        window.addEventListener("resize", this.onWindowResize.bind(this), false);
    }

    /**
     * Applies transformations on window resize.
     */
    onWindowResize() {
        this.RendererService.renderer.setSize(window.innerWidth, window.innerHeight);
        this.CameraService.camera.aspect = window.innerWidth / window.innerHeight;
        this.CameraService.camera.updateProjectionMatrix();
    }

    /**
     * Calls the animation loop.
     */
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.RendererService.renderer.render(this.SceneService.scene, this.CameraService.camera);
        this.OrbitControlsService.controls.update();
        this.UpdateCycleService.update();
    }

}

export {ThreeViewerService};

