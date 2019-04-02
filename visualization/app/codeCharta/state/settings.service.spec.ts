import {SettingsService} from "./settings.service";
import {IRootScopeService} from "angular";
import {getService, instantiateModule, NGMock} from "../../../mocks/ng.mockhelper";

describe("app.codeCharta.core.settings", () => {

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

    describe("Get and set url parameter", () => {

        it("should retrieve the correct query param strings", () => {
            settingsService.settings.areaMetric = "areaStuff";
            settingsService.settings.camera.x = 2;
            expect(settingsService.getQueryParamString()).toContain("areaMetric=areaStuff");
            expect(settingsService.getQueryParamString()).toContain("camera.x=2");
            expect(settingsService.getQueryParamString()).toContain("neutralColorRange.from=0");
        });

        it("should update settings from url", NGMock.mock.inject(($location) => {
            $location.url("http://something.de?scaling.x=42&areaMetric=myMetric&scaling.y=0.32");
            settingsService.updateSettingsFromUrl();
            expect(settingsService.settings.scaling.x).toBe(42);
            expect(settingsService.settings.scaling.y).toBe(0.32);
            expect(settingsService.settings.areaMetric).toBe("myMetric");
        }));

        it("should not update settings.map from url", NGMock.mock.inject(($location) => {
            $location.url("http://something.de?map=aHugeMap");
            settingsService.settings.map = "correctMap" as any as CodeMap;
            settingsService.updateSettingsFromUrl();
            expect(settingsService.settings.map).toBe("correctMap");
        }));
    });

    describe("onSettingsChanged", () => {

        it("should react to data-changed events", () => {
            settingsService.onSettingsChanged = jest.fn();

            //enough metrics
            services.$rootScope.$broadcast("data-changed", {
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
            services.$rootScope.$broadcast("data-changed", {
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
            services.$rootScope.$broadcast("camera-changed", {});
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

            services.$rootScope.$broadcast("data-changed", {
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