import {SettingsService} from "../../core/settings/settings.service";
import {MapTreeViewSearchController} from "./mapTreeViewSearch.component";
import {CodeMapNode} from "../../core/data/model/CodeMap";
import {DataService} from "../../core/data/data.service";
import {getService, instantiateModule} from "../../../../mocks/ng.mockhelper";
import {ITimeoutService, } from "angular";

describe("mapTreeViewSearchController", () => {

    let services, mapTreeViewSearchController: MapTreeViewSearchController;

    beforeEach(() => {
        restartSystem();
        rebuildController();
        withMockedSettingsService();
        withMockedMapTreeViewSearch();
    });

    function restartSystem() {

        instantiateModule("app.codeCharta.ui.mapTreeViewSearch");

        services = {
            $timeout: getService<ITimeoutService>("$timeout"),
            settingsService: getService<SettingsService>("settingsService"),
            dataService: getService<DataService>("dataService"),
        };
    }

    function rebuildController() {
        mapTreeViewSearchController = new MapTreeViewSearchController(
            services.$timeout,
            services.settingsService,
            services.dataService
        );
    }

    function withMockedSettingsService() {
        let simpleHierarchy: CodeMapNode = {
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

        services.settingsService = mapTreeViewSearchController["settingsService"] = jest.fn<SettingsService>(()=>{
            return {
                subscribe: jest.fn(),
                applySettings: jest.fn(),
                onSettingsChanged: jest.fn(),
                settings: {
                    map: {
                        root: simpleHierarchy
                    },
                    blacklist: []
                }
            }
        })();
    }

    function withMockedMapTreeViewSearch() {
        let viewModel = {
            searchPattern: "",
            fileCount: 0,
            folderCount: 0,
            isPatternExcluded: true,
            isPatternHidden: true
        };

        mapTreeViewSearchController.viewModel = viewModel;
    }

    it("onSearchChange", () => {
        mapTreeViewSearchController.viewModel.searchPattern = "aba";
        mapTreeViewSearchController.onSearchChange();

        expect(mapTreeViewSearchController.settingsService.settings.searchPattern).toBe("aba");
        expect(mapTreeViewSearchController.settingsService.settings.searchedNodePaths.includes("/root/a/ab/aba")).toBeTruthy();
    });
});