import "./threeViewer";
import {NG} from "../../../../../mocks/ng.mockhelper";
import sinon from "sinon";
import angular from "angular";
import {ThreeUpdateCycleService} from "./threeUpdateCycleService";
import {ThreeRendererService} from "./threeRendererService";
import {ThreeCameraService} from "./threeCameraService";
import {ThreeSceneService} from "./threeSceneService";
import {SettingsService} from "../../core/settings/settings.service";
import {ThreeOrbitControlsService} from "./threeOrbitControlsService";
import {ThreeViewerService} from "./threeViewerService";
import * as THREE from "three";

/**
 * @test {ThreeUpdateCycleService}
 */
describe("app.codeCharta.ui.codeMap.threeViewer.threeViewerService", function () {


    //noinspection TypeScriptUnresolvedVariable
    beforeEach(angular.mock.module("app.codeCharta.ui.codeMap.threeViewer"));

    //noinspection TypeScriptUnresolvedVariable
    it("should retrieve the angular service instance", NG.mock.inject(function (threeViewerService: ThreeViewerService) {
        expect(threeViewerService).not.toBe(undefined);
    }));

    it("on window resize", NG.mock.inject(function (threeSceneService: ThreeSceneService,
                                                    threeCameraService: ThreeCameraService,
                                                    threeOrbitControlsService: ThreeOrbitControlsService,
                                                    threeRendererService: ThreeRendererService,
                                                    threeUpdateCycleService: ThreeUpdateCycleService,
                                                    settingsService: SettingsService) {
        threeSceneService.scene = {
            updateMatrixWorld: jest.fn()
        };

        threeRendererService.renderer = {
            setSize: jest.fn()
        }

        threeCameraService.camera = {
            aspect: 0,
            updateProjectionMatrix: jest.fn()
        }

        window.innerHeight = 800;
        window.innerWidth = 42;

        let service = new ThreeViewerService(
            threeSceneService,
            threeCameraService,
            threeOrbitControlsService,
            threeRendererService,
            threeUpdateCycleService,
            settingsService
        );

        service.onWindowResize();

        expect(threeSceneService.scene.updateMatrixWorld).toHaveBeenCalledWith(false);
        expect(threeRendererService.renderer.setSize).toHaveBeenCalledWith(window.innerWidth, window.innerHeight);
        expect(threeCameraService.camera.updateProjectionMatrix).toHaveBeenCalled();
        expect(threeCameraService.camera.aspect).toBe(0.0525);

    }));

    it("animate should update all updatables, controls, renderer and request an animation frame", NG.mock.inject(function (threeSceneService: ThreeSceneService,
                                                                                                                           threeCameraService: ThreeCameraService,
                                                                                                                           threeOrbitControlsService: ThreeOrbitControlsService,
                                                                                                                           threeRendererService: ThreeRendererService,
                                                                                                                           threeUpdateCycleService: ThreeUpdateCycleService,
                                                                                                                           settingsService: SettingsService) {

        window.requestAnimationFrame = jest.fn();

        threeRendererService.renderer = {
            render: jest.fn()
        }

        threeOrbitControlsService.controls = {
            update: jest.fn()
        }

        threeUpdateCycleService.update = jest.fn();

        threeSceneService.scene = "some scene";
        threeCameraService.camera = "some camera";

        let service = new ThreeViewerService(
            threeSceneService,
            threeCameraService,
            threeOrbitControlsService,
            threeRendererService,
            threeUpdateCycleService,
            settingsService
        );

        service.animate();

        expect(requestAnimationFrame).toHaveBeenCalled();
        expect(threeRendererService.renderer.render).toHaveBeenCalledWith(threeSceneService.scene, threeCameraService.camera);
        expect(threeOrbitControlsService.controls.update).toHaveBeenCalled();
        expect(threeUpdateCycleService.update).toHaveBeenCalled();


    }));


    it("should initialize correctly", NG.mock.inject(function (threeSceneService: ThreeSceneService,
                                                               threeCameraService: ThreeCameraService,
                                                               threeOrbitControlsService: ThreeOrbitControlsService,
                                                               threeRendererService: ThreeRendererService,
                                                               threeUpdateCycleService: ThreeUpdateCycleService,
                                                               settingsService: SettingsService) {

        threeCameraService.init = jest.fn();
        threeCameraService.camera = new THREE.Object3D();
        threeCameraService.camera.lookAt = jest.fn();

        threeRendererService.init = jest.fn();
        threeRendererService.renderer = {
            domElement: {}
        };

        threeOrbitControlsService.init = jest.fn();

        let element = {
            appendChild: jest.fn()
        };

        let service = new ThreeViewerService(
            threeSceneService,
            threeCameraService,
            threeOrbitControlsService,
            threeRendererService,
            threeUpdateCycleService,
            settingsService
        );

        service.init(element);

        expect(threeCameraService.init).toHaveBeenCalled();
        expect(threeOrbitControlsService.init).toHaveBeenCalled();
        expect(threeRendererService.init).toHaveBeenCalled();
        expect(threeCameraService.camera.lookAt).toHaveBeenCalled();
        expect(element.appendChild).toHaveBeenCalled();

    }));


});