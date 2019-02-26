import {LegendPanelController, PackageList} from "./legendPanel.component";
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
        legendPanelController = new LegendPanelController($timeout, settingsServiceMock, dataServiceMock);
    }

    function mockEverything() {

        $timeout = jest.fn();

        const SettingsServiceMock = jest.fn<SettingsService>(() => ({
            subscribe: jest.fn(),
            applySettings: jest.fn(),
            settings: {
                map: {
                    nodes: null
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
            settingsServiceMock.settings.map.nodes = simpleHierarchy;
        });

        it("set correct markingPackage in Legend", () => {
            settingsServiceMock.settings.markedPackages = [{color: "#FF0000", path: "/root", attributes: {}}];
            const expectedPackageLists: PackageList[] = [{
                colorPixel: "data:image/gif;base64,R0lGODlhAQABAPAAAP8AAP///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==",
                markedPackages: [{color: "#FF0000", path: "/root", attributes: {name: "/root"}}]
            }];

            legendPanelController.onSettingsChanged(settingsServiceMock.settings);

            expect(legendPanelController.packageLists).toEqual(expectedPackageLists);
        });

        it("shorten too long pathName in middle of the string for legendPanel", () => {
            settingsServiceMock.settings.markedPackages = [{color: "#FF0000", path: "/root/a/longNameToBeShortenedInLegend", attributes: {}}];
            const shortenedPathname = "longNameToBe...enedInLegend";

            legendPanelController.onSettingsChanged(settingsServiceMock.settings);
            expect(legendPanelController.packageLists[0].markedPackages[0].attributes["name"]).toEqual(shortenedPathname);
        });

        it("shorten too long pathName at beginning of the string for legendPanel", () => {
            settingsServiceMock.settings.markedPackages = [{color: "#FF0000", path: "/root/a/andAnotherLongNameToShorten", attributes: {}}];
            const shortenedPathname = ".../andAnotherLongNameToShorten";

            legendPanelController.onSettingsChanged(settingsServiceMock.settings);
            expect(legendPanelController.packageLists[0].markedPackages[0].attributes["name"]).toEqual(shortenedPathname);
        });
    });
    
    
});