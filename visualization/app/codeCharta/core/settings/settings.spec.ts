import "./settings.module";
import {getService, instantiateModule, NGMock} from "../../../../mocks/ng.mockhelper";
import sinon from "sinon";
import {KindOfMap, SettingsService} from "./settings.service";
import {CodeMap} from "../data/model/CodeMap";
import {DataService} from "../data/data.service";
import {UrlService} from "../url/url.service";
import {ThreeOrbitControlsService} from "../../ui/codeMap/threeViewer/threeOrbitControlsService";
import {IRootScopeService} from "angular";

describe("app.codeCharta.core.settings", () => {

    let validCodeMap: CodeMap, settingsService: SettingsService, services;

    function setMockValues(areaMetric: string, dynamicMargin: boolean) {
        settingsService.settings.map = validCodeMap;
        settingsService.settings.areaMetric = areaMetric;
        settingsService.settings.dynamicMargin = dynamicMargin;
    }

    function setValidCodeMapData() {
        validCodeMap = {
            fileName: "file",
            projectName: "project",
            nodes: {
                name: "root",
                type: "Folder",
                attributes: {},
                children: [
                    {
                        name: "big leaf",
                        type: "File",
                        attributes: {"rloc": 100, "functions": 10, "mcc": 1, "extremeMetric": 100000},
                        link: "http://www.google.de"
                    },
                    {
                        name: "Parent Leaf",
                        type: "Folder",
                        attributes: {},
                        children: [
                            {
                                name: "small leaf",
                                type: "File",
                                attributes: {"rloc": 30, "functions": 100, "mcc": 100, "extremeMetric": 100000},
                                children: []
                            },
                            {
                                name: "other small leaf",
                                type: "File",
                                attributes: {"rloc": 70, "functions": 1000, "mcc": 10, "extremeMetric": 100000},
                                children: []
                            }
                        ]
                    }
                ]
            }
        };
    }

    beforeEach(() => {
        setValidCodeMapData();
        restartSystem();
        rebuildService();
    });

    function restartSystem() {
        instantiateModule("app.codeCharta.core.settings");

        services = {
            urlService: getService<UrlService>("urlService"),
            dataService: getService<DataService>("dataService"),
            $rootScope: getService<IRootScopeService>("$rootScope"),
            threeOrbitControlsService: getService<ThreeOrbitControlsService>("threeOrbitControlsService")
        };
    }

    function rebuildService() {
        settingsService = new SettingsService(
            services.urlService,
            services.dataService,
            services.$rootScope,
            services.threeOrbitControlsService
        );
    }

    it("should retrieve the angular service instance with disabled delta cubes and no details selected", () => {
        expect(settingsService).not.toBe(undefined);
        expect(settingsService.settings.mode).toBe(KindOfMap.Single);
    });

    describe("computeMargin", () => {

        it("compute margin should compute correct margins for this map", () => {
            setMockValues("rloc", true);
            expect(settingsService.computeMargin()).toBe(32);

            setMockValues("mcc", true);
            expect(settingsService.computeMargin()).toBe(24);

            setMockValues("functions", true);
            expect(settingsService.computeMargin()).toBe(76);
        });

        it("compute margin should compute correct margins for this map if dynamicMargin is off", () => {
            settingsService.settings.margin = 2;
            setMockValues("rloc", false);
            expect(settingsService.computeMargin()).toBe(2);

            setMockValues("mcc", false);
            expect(settingsService.computeMargin()).toBe(2);

            setMockValues("functions", false);
            expect(settingsService.computeMargin()).toBe(2);
        });

        it("compute margin should return default margin if metric does not exist", () => {
            setMockValues("nonExistant", true);
            expect(settingsService.computeMargin()).toBe(SettingsService.MIN_MARGIN);
        });

        it("compute margin should return 100 as margin if computed margin bigger als 100 is", () => {
            setMockValues("extremeMetric", true);
            expect(settingsService.computeMargin()).toBe(100);
        });
    });

    describe("getAdaptedRange in thirds", () => {

        it("getAdaptedRange in thirds for common metricValues", () => {
            settingsService.settings.colorMetric = "rloc";
            services.dataService.data.revisions[0] = validCodeMap;
            expect(settingsService.getAdaptedRange(settingsService.settings)).toEqual({flipped: false, from: 33.33, to: 66.66});
        });
    });

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

    describe("getMetricByIdOrLast", () => {

        it("should return last value when id is bigger than or equal to metrics length", () => {
            const arr = ["a", "b", "c"];
            let result = settingsService.getMetricByIdOrLast(32, arr);
            expect(result).toBe("c");

            result = settingsService.getMetricByIdOrLast(3, arr);
            expect(result).toBe("c");
        });

        it("should return correct value when id is smaller than metrics length", () => {
            const arr = ["a", "b", "c"];
            const result = settingsService.getMetricByIdOrLast(1, arr);
            expect(result).toBe("b");
        });

    });
});