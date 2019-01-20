import {SettingsService} from "../../core/settings/settings.service";
import {ITimeoutService} from "angular";
import "./mapTreeViewSearch";
import {getService, instantiateModule} from "../../../../mocks/ng.mockhelper";
import {MapTreeViewSearchController} from "./mapTreeViewSearch.component";
import {DataService} from "../../core/data/data.service";
import {BlacklistType, CodeMapNode} from "../../core/data/model/CodeMap";
import {CodeMapUtilService} from "../codeMap/codeMap.util.service";

describe("MapTreeViewSearchController", () => {

    let services, viewModel, simpleHierarchy: CodeMapNode, mapTreeViewSearchController: MapTreeViewSearchController;

    beforeEach(() => {
        restartSystem();
        rebuildController();
        withMockedMapTreeViewSearch();
        withMockedSettingsService();
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

    function withMockedMapTreeViewSearch() {
        viewModel = {
            searchPattern: "",
            fileCount: 0,
            folderCount: 0,
        };

        mapTreeViewSearchController.viewModel = viewModel;
    }

    function withMockedSettingsService() {
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
                        {
                            name: "ab",
                            path: "/root/a/ab",
                            type: "File",
                            attributes: {},
                        }
                    ]
                }
            ]
        };

        mapTreeViewSearchController.settingsService.settings.map = {
            root: simpleHierarchy,
        }
    }

    it("should set searchPattern in settings", () => {
        mapTreeViewSearchController.viewModel.searchPattern = "*abc";
        mapTreeViewSearchController.setSearchedNodePathnames();
        expect(mapTreeViewSearchController.settingsService.settings.searchPattern).toBe(mapTreeViewSearchController.viewModel.searchPattern);
    });

    it("should get correct searchedNodePaths with folderCount and fileCount", () => {
        CodeMapUtilService.getNodesByGitignorePath = jest.fn(() => {
            return [simpleHierarchy.children[0], simpleHierarchy.children[0].children[0]];
        });
        mapTreeViewSearchController.settingsService.applySettings = jest.fn();

        mapTreeViewSearchController.setSearchedNodePathnames();

        expect(mapTreeViewSearchController.settingsService.settings.searchedNodePaths).toEqual(["/root/a", "/root/a/ab"]);
        expect(mapTreeViewSearchController.viewModel.folderCount).toBe(2);
        expect(mapTreeViewSearchController.viewModel.fileCount).toBe(0);
        expect(mapTreeViewSearchController.settingsService.applySettings).toHaveBeenCalled();
    });

    it("should add new blacklist entry and clear searchPattern", () => {
        const blacklistItem = {path: "/root/node/path", type: BlacklistType.exclude};
        mapTreeViewSearchController.viewModel.searchPattern = blacklistItem.path;
        mapTreeViewSearchController.onClickBlacklistPattern(blacklistItem.type);
        expect(mapTreeViewSearchController.settingsService.settings.blacklist).toContainEqual(blacklistItem);
        expect(mapTreeViewSearchController.viewModel.searchPattern).toBe("");
    });

    it("should updateViewModel when pattern not blacklisted", () => {
        mapTreeViewSearchController.settingsService.settings.blacklist = [];
        mapTreeViewSearchController.viewModel.searchPattern = "/root/node/path";

        mapTreeViewSearchController.updateViewModel();
        expect(mapTreeViewSearchController.viewModel.isPatternHidden).toBeFalsy();
        expect(mapTreeViewSearchController.viewModel.isPatternExcluded).toBeFalsy();
    });

    it("should updateViewModel when pattern excluded", () => {
        const blacklistItem = {path: "/root/node/path", type: BlacklistType.exclude};
        const anotherBlacklistItem = {path: "/root/another/node/path", type: BlacklistType.exclude};
        mapTreeViewSearchController.settingsService.settings.blacklist = [blacklistItem, anotherBlacklistItem];
        mapTreeViewSearchController.viewModel.searchPattern = "/root/node/path";

        mapTreeViewSearchController.updateViewModel();
        expect(mapTreeViewSearchController.viewModel.isPatternHidden).toBeFalsy();
        expect(mapTreeViewSearchController.viewModel.isPatternExcluded).toBeTruthy();
    });

    it("should updateViewModel when pattern hidden and excluded", () => {
        const blacklistItemExcluded = {path: "/root/node/path", type: BlacklistType.exclude};
        const blacklistItemHidden = {path: "/root/node/path", type: BlacklistType.hide};
        mapTreeViewSearchController.settingsService.settings.blacklist = [blacklistItemExcluded, blacklistItemHidden];
        mapTreeViewSearchController.viewModel.searchPattern = "/root/node/path";

        mapTreeViewSearchController.updateViewModel();
        expect(mapTreeViewSearchController.viewModel.isPatternHidden).toBeTruthy();
        expect(mapTreeViewSearchController.viewModel.isPatternExcluded).toBeTruthy();
    });

});