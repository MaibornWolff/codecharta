import {MapTreeViewHoverEventSubscriber, MapTreeViewLevelController} from "./MapTreeViewLevelComponent";
import {CodeMapActionsService} from "../codeMap/codeMap.actions.service";
import {SettingsService} from "../../core/settings/settings.service";
import {CodeMapUtilService} from "../codeMap/codeMap.util.service";
import {CodeMapNode, ExcludeType} from "../../core/data/model/CodeMap";

describe("MapTreeViewLevelController", () => {

    let mapTreeViewLevelController: MapTreeViewLevelController;
    let $rootScope;
    let node;
    let $event;
    let threeOrbitControlsService;
    let $timeout;


    let codeMapActionsService: CodeMapActionsService;
    let settingsServiceMock: SettingsService;
    let codeMapUtilService: CodeMapUtilService;
    let simpleHierarchy: CodeMapNode;

    function mockEverything() {

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
                    root: null,
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

        settingsServiceMock.settings.map.root = simpleHierarchy;


        codeMapActionsService = new CodeMapActionsService(settingsServiceMock,threeOrbitControlsService,$timeout);

        mapTreeViewLevelController = new MapTreeViewLevelController($rootScope,codeMapActionsService , settingsServiceMock, codeMapUtilService);
    }

    beforeEach(function() {
        mockEverything();
    });


    describe("Folder Color", () => {
        it("Black color if no folder", () => {
            expect(mapTreeViewLevelController.getFolderColor()).toBe("#000");
        });

        it("Return the color defined in the folder ", () => {

            mapTreeViewLevelController.node = codeMapUtilService.getCodeMapNodeFromPath("/root/a/ab", "Folder");
            mapTreeViewLevelController.node.markingColor = "0xff3210";

            expect(mapTreeViewLevelController.getFolderColor()).toBe("#ff3210");
        });

        it("Return black if no markingColor in node ", () => {

            mapTreeViewLevelController.node = codeMapUtilService.getCodeMapNodeFromPath("/root/a/ab", "Folder");

            expect(mapTreeViewLevelController.getFolderColor()).toBe("#000");
        });

    });

    describe("Mouse movement", () => {
        it("Mouse enter", () => {
            mapTreeViewLevelController.onMouseEnter();
            expect($rootScope.$broadcast).toBeCalledWith("should-hover-node", mapTreeViewLevelController.node);
        });
        it("Mouse leave", () => {
            mapTreeViewLevelController.onMouseLeave();
            expect($rootScope.$broadcast).toBeCalledWith("should-unhover-node", mapTreeViewLevelController.node);
        });
    });


    describe("Clicks behaviour", () => {
        it("Right click", () => {


            mapTreeViewLevelController.node = codeMapUtilService.getCodeMapNodeFromPath("/root/a/ab", "Folder");
            let context = {"path": mapTreeViewLevelController.node.path,"type": mapTreeViewLevelController.node.type,"x": $event.clientX,"y": $event.clientY};
            mapTreeViewLevelController.onRightClick($event);

            expect($rootScope.$broadcast).toBeCalledWith("hide-node-context-menu");
            expect($rootScope.$broadcast).toBeCalledWith("show-node-context-menu",context);

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
            mapTreeViewLevelController.codeMapActionsService.isolateNode = jest.fn();
            mapTreeViewLevelController.onLabelClick();

            expect(mapTreeViewLevelController.codeMapActionsService.isolateNode).toHaveBeenCalledWith(mapTreeViewLevelController.node);

        });

        it("Eye click", () => {

            mapTreeViewLevelController.node = codeMapUtilService.getCodeMapNodeFromPath("/root/a/", "Folder");
            mapTreeViewLevelController.codeMapActionsService.toggleNodeVisibility = jest.fn();
            mapTreeViewLevelController.onEyeClick();

            expect(mapTreeViewLevelController.codeMapActionsService.toggleNodeVisibility).toHaveBeenCalledWith(mapTreeViewLevelController.node);
        });


        it("Is leaf", () => {

            mapTreeViewLevelController.node = codeMapUtilService.getCodeMapNodeFromPath("/root/a/ab/aba", "Folder");

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

            expect(CodeMapUtilService.isBlacklisted).
            toHaveBeenCalledWith(mapTreeViewLevelController.node, settingsServiceMock.settings.blacklist, ExcludeType.exclude);
        });

        it("Not blacklisted, not exist", () => {

            CodeMapUtilService.isBlacklisted = jest.fn();
            let blacklisted = mapTreeViewLevelController.isBlacklisted(mapTreeViewLevelController.node);

            expect(blacklisted).toBeFalsy();
        });




        it("Sort leaf", () => {

            mapTreeViewLevelController.node = codeMapUtilService.getCodeMapNodeFromPath("/root/a/ab/aba", "Folder");

            let sortValue = mapTreeViewLevelController.sortByFolder(mapTreeViewLevelController.node);

            expect(sortValue).toBe(0);
        });

        it("Sort not a leaf", () => {

            mapTreeViewLevelController.node = codeMapUtilService.getCodeMapNodeFromPath("/root/a/ab", "Folder");

            let sortValue = mapTreeViewLevelController.sortByFolder(mapTreeViewLevelController.node);

            expect(sortValue).toBe(1);
        });

        it("Subscribe Hover", () => {

            let subscriber: MapTreeViewHoverEventSubscriber;

            MapTreeViewLevelController.subscribeToHoverEvents($rootScope, subscriber);

            let hoverFunction = function(event, args){subscriber.onShouldHoverNode(args)};
            let unhoverFunction = function(event, args){subscriber.onShouldUnhoverNode(args)};

            expect($rootScope.$on).toBeCalledWith("should-hover-node", expect.any(Function));
            expect($rootScope.$on).toBeCalledWith("should-unhover-node", expect.any(Function));

        });

    });


});