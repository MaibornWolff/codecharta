import {LegendPanelController, MarkingPackages} from "./legendPanel.component";
import {SettingsService} from "../../core/settings/settings.service";
import {DataService} from "../../core/data/data.service";
import {CodeMapNode} from "../../core/data/model/CodeMap";
import {CodeMapUtilService} from "../codeMap/codeMap.util.service";

describe("LegendPanelController", () => {

    let legendPanelController: LegendPanelController;
    let $timeout;
    let settingsServiceMock: SettingsService;
    let dataServiceMock: DataService;
    let simpleHierarchy: CodeMapNode;

    function rebuildSUT() {
        legendPanelController = new LegendPanelController($timeout, settingsServiceMock, dataServiceMock, null);
    }

    function mockEverything() {

        $timeout = jest.fn();

        const SettingsServiceMock = jest.fn<SettingsService>(() => ({
            subscribe: jest.fn(),
            applySettings: jest.fn(),
            settings: {
                map: {
                    root: null
                }
            }
        }));

        settingsServiceMock = new SettingsServiceMock();

        const DataServiceMock = jest.fn<DataService>(() => ({
            subscribe: jest.fn(),
            getMaxMetricInAllRevisions: jest.fn()
        }));

        dataServiceMock = new DataServiceMock();

        rebuildSUT();
    }

    beforeEach(function() {
        mockEverything();
    });


    describe("Color to pixel image", () => {
        it("generate pixel in base64", () => {
            expect(legendPanelController.generatePixel("some color value")).toBe("data:image/gif;base64,R0lGODlhAQABAPAAsome color value/yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==");
        });

        it("html -> base64", () => {
            expect(legendPanelController.getImageDataUri("000000")).toBe("data:image/gif;base64,R0lGODlhAQABAPAAAAAAAP///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==");
        });

        it("encode hex to rgb", () => {
            expect(legendPanelController.encodeHex("#000000")).toBe("AAAAAP//");
            expect(legendPanelController.encodeHex("#ff0000")).toBe("AP8AAP//");
            expect(legendPanelController.encodeHex("#0000ff")).toBe("AAAA////");
            expect(legendPanelController.encodeHex("#000")).toBe("AAAAAP//");
            expect(legendPanelController.encodeHex("#f00")).toBe("AP8AAP//");
            expect(legendPanelController.encodeHex("#00f")).toBe("AAAA////");
        });

        it("encode rgb to base64 color value", () => {
            expect(legendPanelController.encodeRGB(0, 0, 0)).toBe("AAAAAP//");
            expect(legendPanelController.encodeRGB(255, 255, 255)).toBe("AP//////");
            expect(legendPanelController.encodeRGB(123, 3, 111)).toBe("AHsDb///");
        });

        it("encode triplet to base64 color value", () => {
            expect(legendPanelController.encodeTriplet(0, 0, 0)).toBe("AAAA");
            expect(legendPanelController.encodeTriplet(255, 255, 255)).toBe("////");
            expect(legendPanelController.encodeTriplet(123, 3, 111)).toBe("ewNv");
        });
    });

    describe("MarkingColor in Legend", () => {

        let codeMapUtilService: CodeMapUtilService;
        beforeEach(function() {
            mockEverything();

            simpleHierarchy = {
                name: "root",
                type: "Folder",
                path: "/root",
                attributes: {},
                children: [
                    {
                        name: "a",
                        type: "Folder",
                        path: "/root/a",
                        attributes: {},
                        children: [
                            {
                                name: "aa",
                                type: "File",
                                path: "/root/a/aa",
                                attributes: {},
                            },
                            {
                                name: "ab",
                                type: "Folder",
                                path: "/root/a/ab",
                                attributes: {},
                                children: [
                                    {
                                        name: "aba",
                                        path: "/root/a/ab/aba",
                                        type: "File",
                                        attributes: {},
                                    }
                                ]
                            },
                        ]
                    },
                    {
                        name: "b",
                        type: "File",
                        path: "/root/b",
                        attributes: {},
                    }
                ]
            };

            codeMapUtilService = new CodeMapUtilService(settingsServiceMock);
            settingsServiceMock.settings.map.root = simpleHierarchy;
        });

        it("set correct markingPackage in Legend", () => {

            let node = codeMapUtilService.getCodeMapNodeFromPath("/root", "Folder");
            node.markingColor = "0xff0000";

            legendPanelController.onSettingsChanged(settingsServiceMock.settings);

            const expectedMarkingPackages: MarkingPackages[] = [{
                markingColor: "data:image/gif;base64,R0lGODlhAQABAPAAAP8AAP///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==",
                packageItem: [{name: "/root", path: "/root"}]
            }];

            expect(legendPanelController.getMarkingPackages()).toEqual(expectedMarkingPackages);

        });

        it("shorten too long pathName in middle of the string for legendPanel", () => {
            let node = codeMapUtilService.getCodeMapNodeFromPath("/root/a/ab", "Folder");
            node.name = "longNameToBeShortenedInLegend";
            node.path = "\"/root/a/longNameToBeShortenedInLegend";
            node.markingColor = "0xff0000";

            const shortenedPathname = "longNameToBe...enedInLegend";
            legendPanelController.onSettingsChanged(settingsServiceMock.settings);
            expect(legendPanelController.getMarkingPackages()[0].packageItem[0].name).toEqual(shortenedPathname);
        });

        it("shorten too long pathName at beginning of the string for legendPanel", () => {
            let node = codeMapUtilService.getCodeMapNodeFromPath("/root/a/ab", "Folder");
            node.name = "andAnotherLongNameToShorten";
            node.path = "\"/root/a/andAnotherLongNameToShorten";
            node.markingColor = "0xff0000";

            const shortenedPathname = ".../andAnotherLongNameToShorten";
            legendPanelController.onSettingsChanged(settingsServiceMock.settings);
            expect(legendPanelController.getMarkingPackages()[0].packageItem[0].name).toEqual(shortenedPathname);
        });
    });
    
    
});