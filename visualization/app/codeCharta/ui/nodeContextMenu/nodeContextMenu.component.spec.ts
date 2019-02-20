import "./nodeContextMenu";

import { IRootScopeService, IWindowService, ITimeoutService } from "angular";
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper";
import { SettingsService } from "../../core/settings/settings.service";
import { CodeMapUtilService } from "../codeMap/codeMap.util.service";
import { CodeMapActionsService } from "../codeMap/codeMap.actions.service";
import { NodeContextMenuController } from "./nodeContextMenu.component";

describe("node context menu", () => {

    let services, element: Element, nodeContextMenuController: NodeContextMenuController;

    beforeEach(() => {
        restartSystem();
        mockElement();
        rebuildController();
        withMockedCodeMapUtilService();
    });

    function restartSystem() {

        instantiateModule("app.codeCharta.ui.nodeContextMenu"); 

        services = {
            $timeout: getService<ITimeoutService>("$timeout"),
            $window: getService<IWindowService>("$window"),
            $rootScope: getService<IRootScopeService>("$rootScope"),
            settingsService: getService<SettingsService>("settingsService"),
            codeMapActionsService: getService<CodeMapActionsService>("codeMapActionsService"),
            codeMapUtilService: getService<CodeMapUtilService>("codeMapUtilService"),
        };

    }
    
    function mockElement() {

        element = jest.fn<Element>(()=>{
            return [
                {
                    children: [
                        {
                            clientWidth: 50,
                            clientHeight: 100,
                        }
                    ]
                }
            ];
        })();

    }

    function rebuildController() {
        nodeContextMenuController = new NodeContextMenuController(
            element, 
            services.$timeout,
            services.$window,
            services.$rootScope,
            services.settingsService,
            services.codeMapActionsService,
            services.codeMapUtilService
        );
    }

    function withMockedEventMethods() {
        services.$rootScope.$on = nodeContextMenuController["$rootScope"].$on = jest.fn();
        services.$rootScope.$broadcast = nodeContextMenuController["$rootScope"].$broadcast = jest.fn();
    }

    function withMockedSettingsService() {
        services.settingsService = nodeContextMenuController["settingsService"] = jest.fn<SettingsService>(()=>{
            return {
                settings: {
                    markedPackages: []
                }
            }
        })();
    }

    function withMockedCodeMapUtilService() {
        services.codeMapUtilService = nodeContextMenuController["codeMapUtilService"] = jest.fn<CodeMapUtilService>(()=>{
            return {
                getCodeMapNodeFromPath: jest.fn()
            }
        })();
    }

    function withMockedCodeMapActionService() {
        services.codeMapActionsService = nodeContextMenuController["codeMapActionsService"] = jest.fn<CodeMapActionsService>(()=>{
            return {
                amountOfDependentEdges: jest.fn(),
                amountOfVisibleDependentEdges: jest.fn(),
                getParentMP: jest.fn(),
                anyEdgeIsVisible: jest.fn(),
                hideNode: jest.fn(),
                markFolder: jest.fn(),
                unmarkFolder: jest.fn(),
                focusNode: jest.fn(),
                showDependentEdges: jest.fn(),
                hideDependentEdges: jest.fn(),
                hideAllEdges: jest.fn(),
                excludeNode: jest.fn()
            }
        })();
    }

    afterEach(()=>{
        jest.resetAllMocks();
    });

    describe("event related behavior",()=>{

        it("should subscribe to 'show-node-context-menu' events",()=>{
            withMockedEventMethods();
            rebuildController();
            expect(services.$rootScope.$on).toHaveBeenCalledWith("show-node-context-menu", expect.any(Function));
        });

        it("should subscribe to 'hide-node-context-menu' events",()=>{
            withMockedEventMethods();
            rebuildController();
            expect(services.$rootScope.$on).toHaveBeenCalledWith("hide-node-context-menu", expect.any(Function));
        });

        it("should broadcast 'show-node-context-menu' when 'show' method is called",()=>{
            withMockedEventMethods();
            NodeContextMenuController.broadcastShowEvent(services.$rootScope, "somepath", "sometype", 42, 24);
            expect(services.$rootScope.$broadcast).toHaveBeenCalledWith("show-node-context-menu", {"path": "somepath", "type": "sometype", "x": 42, "y": 24});
        });

        it("should broadcast 'hide-node-context-menu' when 'hide' method is called",()=>{
            withMockedEventMethods();
            NodeContextMenuController.broadcastHideEvent(services.$rootScope);
            expect(services.$rootScope.$broadcast).toHaveBeenCalledWith("hide-node-context-menu");
        });

        it("should call 'showContextMenu' on 'show-node-context-menu' events",()=>{
            nodeContextMenuController.show = jest.fn();
            NodeContextMenuController.broadcastShowEvent(services.$rootScope, "somepath", "sometype", 42, 24);
            services.$rootScope.$digest();
            expect(nodeContextMenuController.show).toHaveBeenCalledWith("somepath", "sometype", 42, 24);
        });

        it("should call 'hideContextMenu' on 'hide-node-context-menu' events",()=>{
            nodeContextMenuController.hide = jest.fn();
            NodeContextMenuController.broadcastHideEvent(services.$rootScope);
            services.$rootScope.$digest();
            expect(nodeContextMenuController.hide).toHaveBeenCalled();
        });

    });

    describe("showing and hiding", ()=>{

        it("hiding the context menu should set the relevant building to null or undefined after angular digestion", ()=>{
            nodeContextMenuController["contextMenuBuilding"] = true;
            nodeContextMenuController.hide();
            services.$timeout.flush();
            expect(nodeContextMenuController["contextMenuBuilding"]).not.toBeTruthy();
        });

        it("showing the context menu should should set the correct building after some timeout", ()=>{
            withMockedCodeMapActionService();
            nodeContextMenuController.setPosition = jest.fn();
            services.codeMapUtilService.getCodeMapNodeFromPath = jest.fn((path, type) => { return {"name":path, "type": type, "attributes": {}}; });
            nodeContextMenuController.show("somepath", "sometype", 42, 24);
            services.$timeout.flush(100);
            expect(nodeContextMenuController["contextMenuBuilding"]).toEqual({"attributes": {}, "name": "somepath", "type": "sometype"});
        });

        it("showing the context menu should set the edge fields after some timeout", ()=>{
            withMockedCodeMapActionService();
            nodeContextMenuController.setPosition = jest.fn();
            services.codeMapUtilService.getCodeMapNodeFromPath = jest.fn();
            services.codeMapActionsService.amountOfDependentEdges = jest.fn(()=>{return 42;});
            services.codeMapActionsService.amountOfVisibleDependentEdges = jest.fn(() => 24);
            services.codeMapActionsService.anyEdgeIsVisible = jest.fn(()=>true);
            nodeContextMenuController.show("somepath", "sometype", 42, 24);
            services.$timeout.flush(100);

            expect(nodeContextMenuController["amountOfDependentEdges"]).toBe(42);
            expect(nodeContextMenuController["amountOfVisibleDependentEdges"]).toBe(24);
            expect(nodeContextMenuController["anyEdgeIsVisible"]).toBeTruthy();
        });

        describe("calculate position", ()=>{

            beforeEach(() => {
                services.$window.innerWidth = 800;
                services.$window.innerHeight = 600;
            });

            function testPositionCalculation(expectedX, expectedY, mouseX, mouseY) {
                const {x, y} = nodeContextMenuController.calculatePosition(mouseX, mouseY);
                expect(x).toBe(expectedX);
                expect(y).toBe(expectedY);
            }

            it("menu does not need to be repositioned in order to fit into the window", ()=>{
                testPositionCalculation(400, 300, 400, 300);
            });

            it("menu has to be repositioned on x-coordinate in order to fit into the window", ()=>{
                testPositionCalculation(750, 300, 799, 300);
            });

            it("menu has to be repositioned on y-coordinate in order to fit into the window", ()=>{
                testPositionCalculation(400, 500, 400, 599);
            });
            
            it("menu has to be repositioned on both coordinates in order to fit into the window", ()=>{
                testPositionCalculation(750, 500, 799, 599);
            });

        });

    });

    describe("actions that delegate to CodeMapActionsService", ()=>{

        const actions = [
            "hideNode", 
            "markFolder", 
            "unmarkFolder", 
            "focusNode",
            "showDependentEdges",
            "hideDependentEdges",
            "hideAllEdges",
            "excludeNode"
        ];

        beforeEach(()=>{
            withMockedCodeMapActionService();
            nodeContextMenuController.hide = jest.fn();
        });

        it("should close the context menu", ()=>{
            actions.forEach(a => {
                nodeContextMenuController[a]();
            });
            expect(nodeContextMenuController.hide).toHaveBeenCalledTimes(actions.length);
        });

        it("should call the correct CodeChartaActionService method", ()=>{
            actions.forEach(a => {
                nodeContextMenuController[a]();
                expect(nodeContextMenuController["codeMapActionsService"][a]).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe("marking color", ()=>{

        beforeEach(()=>{
            withMockedSettingsService();
            nodeContextMenuController.unmarkFolder = jest.fn();
            nodeContextMenuController.markFolder = jest.fn();
        });

        describe("click color", ()=>{

            it("unmark folder when current folder is marked", () => {
                nodeContextMenuController.currentFolderIsMarkedWithColor = jest.fn(()=>true);              
                nodeContextMenuController.clickColor("some color");
                expect(nodeContextMenuController.unmarkFolder).toBeCalled();
                expect(nodeContextMenuController.markFolder).not.toBeCalled();
            });
    
            it("mark folder when current folder is  unmarked", () => {
                nodeContextMenuController.currentFolderIsMarkedWithColor = jest.fn(()=>false);              
                nodeContextMenuController.clickColor("some color");
                expect(nodeContextMenuController.markFolder).toBeCalledWith("some color");
                expect(nodeContextMenuController.unmarkFolder).not.toBeCalled();
            });

        });

        it("current folder is marked when building's marking color is the same as the given one", () => {
            withMockedCodeMapActionService();
            nodeContextMenuController["contextMenuBuilding"] = { path: "/root/node/path" };
            nodeContextMenuController.settingsService.settings.markedPackages = [{
                path: "/root/node/path", color: "#123FDE"
            }];
            const result = nodeContextMenuController.currentFolderIsMarkedWithColor("#123FDE");
            expect(result).toBeTruthy();
        });      

        it("current folder is not marked when building's marking color is not the same as the given one", () => {
            withMockedCodeMapActionService();
            nodeContextMenuController["contextMenuBuilding"] = { path: "/root/node/path"  };
            nodeContextMenuController.settingsService.settings.markedPackages = [{
                path: "/root/node/path", color: "#123ABC"
            }];
            const result = nodeContextMenuController.currentFolderIsMarkedWithColor("#123FDE");
            expect(result).toBeFalsy();
        });
    });

    describe("node is folder", ()=>{

        it("node with children is a folder", ()=>{
            nodeContextMenuController["contextMenuBuilding"] = { children:[ { a: "something" } ] };            
            expect(nodeContextMenuController.nodeIsFolder()).toBeTruthy();
        });
    
        it("node with empty children array is not a folder", ()=>{
            nodeContextMenuController["contextMenuBuilding"] = { children:[] };            
            expect(nodeContextMenuController.nodeIsFolder()).toBeFalsy();
        });
        
        it("node with no children array is not a folder", ()=>{
            nodeContextMenuController["contextMenuBuilding"] = { children: null };            
            expect(nodeContextMenuController.nodeIsFolder()).toBeFalsy();
        });
    
        it("empty node is not a folder", ()=>{
            nodeContextMenuController["contextMenuBuilding"] = {};            
            expect(nodeContextMenuController.nodeIsFolder()).toBeFalsy();
        });
    
        it("null is not a folder", ()=>{
            nodeContextMenuController["contextMenuBuilding"] = null;            
            expect(nodeContextMenuController.nodeIsFolder()).toBeFalsy();
        });

    });

});
