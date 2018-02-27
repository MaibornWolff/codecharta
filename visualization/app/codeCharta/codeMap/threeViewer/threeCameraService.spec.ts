import "./threeViewer";
import {NG} from "../../../../mocks/ng.mockhelper";
import sinon from "sinon";
import * as THREE from "three";

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
    it("init should create a new PerspectiveCamera", NG.mock.inject(function (threeCameraService, settingsService) {

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

});