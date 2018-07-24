import {SettingsService} from "../../../core/settings/settings.service";

jest.mock("../../../core/settings/settings.service");

import {PerspectiveCamera} from "three";

jest.mock("three");

import {ThreeCameraService} from "./threeCameraService";

describe("threeCameraService", () => {

    let sut: ThreeCameraService;

    beforeEach(() => {
        SettingsService.mockClear();
        PerspectiveCamera.mockClear();
        sut = new ThreeCameraService();
    });

    it("cameras near plane should be 100 to prevent flickering surfaces", () => {
        sut.setPosition = jest.fn();
        sut.init(new SettingsService(), 100, 50);
        expect(PerspectiveCamera).toHaveBeenCalledWith(ThreeCameraService.VIEW_ANGLE, 100/50, 100, ThreeCameraService.FAR);
    });

    it("init should set the camera position", () => {
        sut.setPosition = jest.fn();
        sut.init(new SettingsService());
        expect(sut.setPosition).toHaveBeenCalled();
    });

    it("onSettingsChanged should set the camera position", () => {
        sut.setPosition = jest.fn();
        sut.onSettingsChanged({camera: {x: 0, y: 1, z: 2}});
        expect(sut.setPosition).toHaveBeenCalledWith(0, 1, 2);
    });

    it("setPosition should update the camera position", () => {
        sut.camera = new PerspectiveCamera();
        sut.camera.position = {
            set: jest.fn()
        };
        sut.setPosition(0,1,2);
        expect(sut.camera.position.set).toHaveBeenCalledWith(0, 1, 2);
    });

});