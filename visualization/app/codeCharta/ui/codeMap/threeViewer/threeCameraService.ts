"use strict";

import * as THREE from "three";
import {
    SettingsServiceSubscriber,
    Settings,
    SettingsService
} from "../../../core/settings/settings.service";
import { PerspectiveCamera } from "three";

class ThreeCameraService implements SettingsServiceSubscriber {
    public static SELECTOR = "threeCameraService";

    public static VIEW_ANGLE = 45;
    public static NEAR = 100;
    public static FAR = 200000; //TODO optimize renderer for far objects

    public camera: PerspectiveCamera;

    constructor() {}

    onSettingsChanged(settings: Settings, event: Event) {
        this.setPosition(
            settings.camera.x,
            settings.camera.y,
            settings.camera.z
        );
    }

    init(
        settingsService: SettingsService,
        containerWidth: number,
        containerHeight: number,
        x: number,
        y: number,
        z: number
    ) {
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

    setPosition(x: number, y: number, z: number) {
        this.camera.position.set(x, y, z);
    }
}

export { ThreeCameraService };
