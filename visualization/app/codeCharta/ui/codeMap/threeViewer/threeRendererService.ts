import * as THREE from "three";
import { WebGLRenderer } from "three";
import {
    SettingsService,
    Settings,
    SettingsServiceSubscriber
} from "../../../core/settings/settings.service";

/**
 * A service which manages the Three.js renderer in an angular way.
 */
export class ThreeRendererService implements SettingsServiceSubscriber {
    public static SELECTOR = "threeRendererService";

    public static BACKGROUND_COLOR = {
        white: 0xffffff,
        normal: 0xeeeedd
    };

    public static CLEAR_COLOR = ThreeRendererService.BACKGROUND_COLOR.normal;

    public static CLEAR_ALPHA = 1;

    public static RENDER_OPTIONS = {
        antialias: true,
        preserveDrawingBuffer: true
    };

    public renderer: WebGLRenderer;

    /* @ngInject */
    constructor(private settingsService: SettingsService) {}

    /**
     * Inits the renderer.
     */
    public init(containerWidth: number, containerHeight: number){
        this.renderer = new THREE.WebGLRenderer(ThreeRendererService.RENDER_OPTIONS);
        this.settingsService.subscribe(this);
        this.onSettingsChanged(this.settingsService.settings, null);
        this.setCurrentClearColorFromSettings(this.settingsService.settings);
        this.renderer.setSize(containerWidth, containerHeight);
        this.renderer.setClearColor(
            ThreeRendererService.CLEAR_COLOR,
            ThreeRendererService.CLEAR_ALPHA
        );
    }

    public setCurrentClearColorFromSettings(settings: Settings) {
        if (settings.isWhiteBackground) {
            ThreeRendererService.CLEAR_COLOR =
                ThreeRendererService.BACKGROUND_COLOR.white;
        } else {
            ThreeRendererService.CLEAR_COLOR =
                ThreeRendererService.BACKGROUND_COLOR.normal;
        }
    }

    public onSettingsChanged(settings: Settings, event) {
        this.setCurrentClearColorFromSettings(settings);
        this.renderer.setClearColor(
            ThreeRendererService.CLEAR_COLOR,
            ThreeRendererService.CLEAR_ALPHA
        );
    }
}
