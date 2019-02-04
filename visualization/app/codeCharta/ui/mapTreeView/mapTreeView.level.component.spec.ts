import {MapTreeViewHoverEventSubscriber, MapTreeViewLevelController} from "./mapTreeView.level.component";
import {CodeMapActionsService} from "../codeMap/codeMap.actions.service";
import {SettingsService} from "../../core/settings/settings.service";
import {CodeMapUtilService} from "../codeMap/codeMap.util.service";
import {CodeMapNode, BlacklistType} from "../../core/data/model/CodeMap";
import {IRootScopeService} from "angular";
import "./mapTreeView";
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper";
import * as marked from "marked";
import Code = marked.Tokens.Code;
import {ColorService} from "../../core/color/color.service";

describe("MapTreeViewLevelController", () => {

    let mapTreeViewLevelController: MapTreeViewLevelController;
    let $rootScope;
    let $event;
    let subscriber;
    let threeOrbitControlsService;
    let $timeout;

    let codeMapActionsService: CodeMapActionsService;
    let settingsServiceMock: SettingsService;
    let codeMapUtilService: CodeMapUtilService;
    let colorService: ColorService;
    let simpleHierarchy: CodeMapNode;

    function mockEverything() {


        const MockSubscriber = jest.fn<MapTreeViewHoverEventSubscriber>(()=>({
            onShouldHoverNode: jest.fn(),
            onShouldUnhoverNode: jest.fn()
        }));


        subscriber = new MockSubscriber();

        $rootScope = jest.fn();

        $timeout = jest.fn();

        $rootScope = {
            $broadcast: jest.fn(),
            $on: jest.fn()
        };

        $event = {
            clientX: jest.fn(),
            clientY: jest.fn()
        };

        const SettingsServiceMock = jest.fn<SettingsService>(() => ({
            subscribe: jest.fn(),
            applySettings: jest.fn(),
            settings: {
                map: {
                    nodes: null,
                    blacklist: {},
                }
            }
        }));

        settingsServiceMock = new SettingsServiceMock();

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
                    ]
                }
            ]
        };

        codeMapUtilService = new CodeMapUtilService(settingsServiceMock);
        settingsServiceMock.settings.map.nodes = simpleHierarchy;
        codeMapActionsService = new CodeMapActionsService(settingsServiceMock, threeOrbitControlsService, $timeout);
        colorService = new ColorService();
        mapTreeViewLevelController = new MapTreeViewLevelController($rootScope, codeMapActionsService, settingsServiceMock, colorService);
    }

    beforeEach(function() {
        mockEverything();
    });

    describe("MarkingColor", () => {

        it("Black color if no folder", () => {
            mapTreeViewLevelController.node = { path: "/root/node/path", type: "File" };
            expect(mapTreeViewLevelController.getMarkingColor()).toBe("#000");
        });

        it("Return the markinColor if the matching markedPackage", () => {
            mapTreeViewLevelController.node = { path: "/root/node/path", type: "Folder" };
            mapTreeViewLevelController.settingsService.settings.markedPackages = [{
                path: "/root/node/path", color: "0x123FDE"
            }];
            expect(mapTreeViewLevelController.getMarkingColor()).toBe("#123FDE");
        });

        it("Return black if no markingColor in node", () => {
            mapTreeViewLevelController.node = { path: "/root/node/path", type: "Folder" };
            mapTreeViewLevelController.settingsService.settings.markedPackages = [];
            expect(mapTreeViewLevelController.getMarkingColor()).toBe("#000");
        });
    });

    describe("Mouse movement", () => {

        it("Mouse enter", () => {
            mapTreeViewLevelController.onMouseEnter();
            expect($rootScope.$broadcast).toHaveBeenCalledWith("should-hover-node", mapTreeViewLevelController.node);
        });

        it("Mouse leave", () => {
            mapTreeViewLevelController.onMouseLeave();
            expect($rootScope.$broadcast).toHaveBeenCalledWith("should-unhover-node", mapTreeViewLevelController.node);
        });
    });


    describe("Clicks behaviour", () => {

        it("Right click", () => {
            mapTreeViewLevelController.node = codeMapUtilService.getCodeMapNodeFromPath("/root/a/ab", "Folder");
            let context = {"path": mapTreeViewLevelController.node.path, "type": mapTreeViewLevelController.node.type, "x": $event.clientX, "y": $event.clientY};
            mapTreeViewLevelController.onRightClick($event);

            expect($rootScope.$broadcast).toHaveBeenCalledWith("hide-node-context-menu");
            expect($rootScope.$broadcast).toHaveBeenCalledWith("show-node-context-menu", context);
        });

        it("Folder click collapse", () => {
            mapTreeViewLevelController.collapsed = true;
            mapTreeViewLevelController.onFolderClick();
            expect(mapTreeViewLevelController.collapsed).toBeFalsy();
        });

        it("Folder click uncollapse", () => {
            mapTreeViewLevelController.collapsed = false;
            mapTreeViewLevelController.onFolderClick();
            expect(mapTreeViewLevelController.collapsed).toBeTruthy();
        });

        it("Label click", () => {
            mapTreeViewLevelController.node = codeMapUtilService.getCodeMapNodeFromPath("/root/a/", "Folder");
            mapTreeViewLevelController.codeMapActionsService.focusNode = jest.fn();
            mapTreeViewLevelController.onLabelClick();

            expect(mapTreeViewLevelController.codeMapActionsService.focusNode).toHaveBeenCalledWith(mapTreeViewLevelController.node);
        });

        it("Eye click", () => {
            mapTreeViewLevelController.node = codeMapUtilService.getCodeMapNodeFromPath("/root/a/", "Folder");
            mapTreeViewLevelController.codeMapActionsService.toggleNodeVisibility = jest.fn();
            mapTreeViewLevelController.onEyeClick();

            expect(mapTreeViewLevelController.codeMapActionsService.toggleNodeVisibility).toHaveBeenCalledWith(mapTreeViewLevelController.node);
        });

        it("Is leaf", () => {
            mapTreeViewLevelController.node = codeMapUtilService.getCodeMapNodeFromPath("/root/a/ab/aba", "File");
            expect(mapTreeViewLevelController.isLeaf()).toBeTruthy();
        });

        it("Is not leaf", () => {
            mapTreeViewLevelController.node = codeMapUtilService.getCodeMapNodeFromPath("/root/a/ab", "Folder");
            expect(mapTreeViewLevelController.isLeaf(mapTreeViewLevelController.node)).toBeFalsy();
        });

        it("Is blacklisted", () => {
            mapTreeViewLevelController.node = codeMapUtilService.getCodeMapNodeFromPath("/root/a/ab", "Folder");

            CodeMapUtilService.isBlacklisted = jest.fn();
            mapTreeViewLevelController.isBlacklisted(mapTreeViewLevelController.node);

            expect(CodeMapUtilService.isBlacklisted).toHaveBeenCalledWith(
                mapTreeViewLevelController.node, settingsServiceMock.settings.blacklist, BlacklistType.exclude);
        });

        it("Not blacklisted, not exist", () => {
            CodeMapUtilService.isBlacklisted = jest.fn();
            let blacklisted = mapTreeViewLevelController.isBlacklisted(mapTreeViewLevelController.node);
            expect(blacklisted).toBeFalsy();
        });

        it("Is searched", () => {
            mapTreeViewLevelController.node = codeMapUtilService.getCodeMapNodeFromPath("/root/a/ab", "Folder");
            mapTreeViewLevelController.settingsService.settings.searchedNodePaths = ["/root/a", "/root/a/ab"];
            let searched = mapTreeViewLevelController.isSearched(mapTreeViewLevelController.node);
            expect(searched).toBeTruthy();
        });

        it("Is not searched", () => {
            mapTreeViewLevelController.node = codeMapUtilService.getCodeMapNodeFromPath("/root/a/ab", "Folder");
            mapTreeViewLevelController.settingsService.settings.searchedNodePaths = ["/root/a"];
            let searched = mapTreeViewLevelController.isSearched(mapTreeViewLevelController.node);
            expect(searched).toBeFalsy();
        });

        it("Sort leaf", () => {
            mapTreeViewLevelController.node = codeMapUtilService.getCodeMapNodeFromPath("/root/a/ab/aba", "File");
            let sortValue = mapTreeViewLevelController.sortByFolder(mapTreeViewLevelController.node);
            expect(sortValue).toBe(0);
        });

        it("Sort not a leaf", () => {
            mapTreeViewLevelController.node = codeMapUtilService.getCodeMapNodeFromPath("/root/a/ab", "Folder");
            let sortValue = mapTreeViewLevelController.sortByFolder(mapTreeViewLevelController.node);
            expect(sortValue).toBe(1);
        });

        it("Subscribe Hover", () => {

            instantiateModule("app.codeCharta.ui.mapTreeView"); 

            const services = {
                $rootScope: getService<IRootScopeService>("$rootScope"),
                settingsService: getService<SettingsService>("settingsService"),
                codeMapActionsService: getService<CodeMapActionsService>("codeMapActionsService"),
            };

            mapTreeViewLevelController = new MapTreeViewLevelController(services.$rootScope, services.codeMapActionsService, services.settingsService);

            mapTreeViewLevelController.node = codeMapUtilService.getCodeMapNodeFromPath("/root/a/ab/aba", "File");
            MapTreeViewLevelController.subscribeToHoverEvents(services.$rootScope, subscriber);
            mapTreeViewLevelController.onMouseEnter();
            mapTreeViewLevelController.onMouseLeave();
            services.$rootScope.$digest();

            expect(subscriber.onShouldHoverNode).toBeCalledWith(mapTreeViewLevelController.node);
            expect(subscriber.onShouldUnhoverNode).toBeCalledWith(mapTreeViewLevelController.node);

        });
    });
});