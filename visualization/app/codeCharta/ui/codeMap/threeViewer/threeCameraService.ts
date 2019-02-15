"use strict";

import * as THREE from "three";
import {SettingsServiceSubscriber, Settings, SettingsService} from "../../../core/settings/settings.service";
import {PerspectiveCamera} from "three";

class ThreeCameraService implements SettingsServiceSubscriber {
    public static SELECTOR = "threeCameraService";

    public static VIEW_ANGLE = 45;
    public static NEAR = 100;
    public static FAR = 200000; //TODO optimize renderer for far objects

    public camera: PerspectiveCamera;

    public onSettingsChanged(settings: Settings, event: Event) {
        this.setPosition(settings.camera.x, settings.camera.y, settings.camera.z);
    }

    /**
     * Inits the camera with a specific container width and height
     * @param {number} containerWidth initial width
     * @param {number} containerHeight initial height
     * @param {number} x camera position component x
     * @param {number} y camera position component y
     * @param {number} z camera position component z
     */
    public init(settingsService: SettingsService, containerWidth: number, containerHeight: number, x: number, y: number, z: number) {
        const aspect = containerWidth / containerHeight;
        this.camera = new THREE.PerspectiveCamera(
            ThreeCameraService.VIEW_ANGLE,
            aspect,
            ThreeCameraService.NEAR,
            ThreeCameraService.FAR
        );
        this.setPosition(x, y, z);
        settingsService.subscribe(this);
    }

    public setPosition(x: number, y: number, z: number) {
        this.camera.position.set(x, y, z);
    }
}

export { ThreeCameraService };
