import {SettingsService} from "./settings.service";
import {IRootScopeService} from "angular";
import {getService, instantiateModule} from "../../../mocks/ng.mockhelper";

xdescribe("settingService", () => {

    let validCodeMap: CodeMap
    let settingsService: SettingsService
    let $rootScope: IRootScopeService

    beforeEach(() => {
        restartSystem();
        rebuildService();
    });

    function restartSystem() {
        instantiateModule("app.codeCharta.state.settings");

        $rootScope = getService<IRootScopeService>("$rootScope")
    }

    function rebuildService() {
        settingsService = new SettingsService($rootScope)
    }

    describe("onSettingsChanged", () => {

        it("should react to data-changed events", () => {
            settingsService.onSettingsChanged = jest.fn();

            //enough metrics
            $rootScope.$broadcast("data-changed", {
                renderMap: validCodeMap,
                metrics: ["a", "b", "c"],
                revisions: [validCodeMap, validCodeMap]
            });

            expect(settingsService.settings.map.fileName).toBe("file");
            expect(settingsService.settings.areaMetric).toBe("a");
            expect(settingsService.settings.heightMetric).toBe("b");
            expect(settingsService.settings.colorMetric).toBe("c");

            //not enough metrics
            validCodeMap.fileName = "file2";
            $rootScope.$broadcast("data-changed", {
                renderMap: validCodeMap,
                metrics: ["a"],
                revisions: [validCodeMap, validCodeMap]
            });

            expect(settingsService.settings.map.fileName).toBe("file2");
            expect(settingsService.settings.areaMetric).toBe("a");
            expect(settingsService.settings.heightMetric).toBe("a");
            expect(settingsService.settings.colorMetric).toBe("a");

            expect(settingsService.onSettingsChanged).toHaveBeenCalledTimes(2);
        });

        it("should react to camera-changed events", () => {
            settingsService.onCameraChanged = sinon.spy();
            $rootScope.$broadcast("camera-changed", {});
            expect(settingsService.onCameraChanged.calledOnce);
        });

        it("onCameraChanged should update settings object but not call onSettingsChanged to ensure performance", () => {
            settingsService.onSettingsChanged = sinon.spy();
            settingsService.onCameraChanged({position: {x: 0, y: 0, z: 42}});
            expect(!settingsService.onSettingsChanged.called);
            expect(settingsService.settings.camera.z).toBe(42);
        });

        it("should react to data-changed events and set metrics correctly", () => {
            settingsService.onSettingsChanged = sinon.spy();

            $rootScope.$broadcast("data-changed", {
                renderMap: validCodeMap,
                metrics: ["a", "b"],
                revisions: [validCodeMap, validCodeMap]
            });

            expect(settingsService.settings.map.fileName).toBe("file");
            expect(settingsService.settings.areaMetric).toBe("a");
            expect(settingsService.settings.heightMetric).toBe("b");
            expect(settingsService.settings.colorMetric).toBe("b");
            expect(settingsService.onSettingsChanged.calledOnce);
        });
    });
});