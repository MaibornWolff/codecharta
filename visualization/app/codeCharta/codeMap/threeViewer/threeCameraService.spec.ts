import "./threeViewer.ts";
import {NG} from "../../../ng.mockhelper.ts";
import sinon from "sinon";
import THREE from "three";

/**
 * @test {ThreeCameraService}
 */
describe("app.codeCharta.codeMap.threeViewer.threeCameraService", function () {

    //noinspection TypeScriptUnresolvedVariable
    beforeEach(NG.mock.module("app.codeCharta.codeMap.threeViewer"));

    //noinspection TypeScriptUnresolvedVariable
    it("should retrieve the angular service instance", NG.mock.inject(function (threeCameraService) {
        expect(threeCameraService).not.toBe(undefined);
    }));

    //noinspection TypeScriptUnresolvedVariable
    /**
     * @test {ThreeCameraService#init}
     */
    xit("init should create a new PerspectiveCamera", NG.mock.inject(function (threeCameraService, settingsService) {

        //mocks
        let spy = sinon.spy(THREE, "PerspectiveCamera");

        //action
        threeCameraService.init(settingsService);

        //expectations
        expect(spy.calledOnce);

    }));

    //noinspection TypeScriptUnresolvedVariable
    /**
     * @test {ThreeCameraService#init}
     */
    it("init should set the camera position", NG.mock.inject(function (threeCameraService, settingsService) {

        //action
        threeCameraService.init(settingsService);

        //expectations
        expect(threeCameraService.camera.position).not.toBe(undefined);

    }));

    //noinspection TypeScriptUnresolvedVariable
    /**
     * @test {ThreeCameraService#init}
     */
    xit("the near plane of the viewing frustum should be at least 100 to prevent flickering of planes", NG.mock.inject(function (threeCameraService, settingsService) {

        //action
        threeCameraService.init(settingsService);

        //expectations
        expect(threeCameraService.camera.near).toBeGreaterThan(99);

    }));

});