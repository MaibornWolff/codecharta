import {MapTreeViewLevelController} from "./MapTreeViewLevelComponent";
import {CodeMapActionsService} from "../codeMap/codeMap.actions.service";
import {SettingsService} from "../../core/settings/settings.service";
import {CodeMapUtilService} from "../codeMap/codeMap.util.service";
import {CodeMapNode} from "../../core/data/model/CodeMap";
import {CodeMapMouseEventService} from "../codeMap/codeMap.mouseEvent.service";
//jest.mock("../codeMap/codeMap.mouseEvent.service");

describe("MapTreeViewLevelController", () => {

    let mapTreeViewLevelController: MapTreeViewLevelController;
    let $rootScope;
    let node;

    let codeMapActionsService: CodeMapActionsService;
    let settingsServiceMock: SettingsService;
    let codeMapUtilService: CodeMapUtilService;
    let simpleHierarchy: CodeMapNode;

    function mockEverything() {

        $rootScope = jest.fn();

        $rootScope = {
            $broadcast: jest.fn()}

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


    describe("", () => {
        it("", () => {

        });
        it("", () => {

        });
    });


});