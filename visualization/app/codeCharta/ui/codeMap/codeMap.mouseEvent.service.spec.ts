import {CodeMapMouseEventService, CodeMapMouseEventServiceSubscriber} from "./codeMap.mouseEvent.service";

import {ThreeCameraService} from "./threeViewer/threeCameraService";
jest.mock("./threeViewer/threeCameraService");

import {ThreeRendererService} from "./threeViewer/threeRendererService";
jest.mock("./threeViewer/threeRendererService");

import {ThreeSceneService} from "./threeViewer/threeSceneService";
jest.mock("./threeViewer/threeSceneService");

import {ThreeUpdateCycleService} from "./threeViewer/threeUpdateCycleService";
jest.mock("./threeViewer/threeUpdateCycleService");

import {ThreeViewerService} from "./threeViewer/threeViewerService";
jest.mock("./threeViewer/threeViewerService");

import {CodeMapRenderService} from "./codeMap.render.service";
jest.mock("./codeMap.render.service");

import {MapTreeViewLevelController} from "../mapTreeView/mapTreeViewLevelComponent";
jest.mock("../mapTreeView/mapTreeViewLevelComponent");

describe("mouseEventService", () => {

    let sut: CodeMapMouseEventService;

    let $rootScope = {
        $on: jest.fn()
    };

    let $window = {};

    beforeEach(() => {
        clear();
        rebuild();
    });

    function clear() {
        ThreeCameraService.mockClear();
        ThreeRendererService.mockClear();
        ThreeSceneService.mockClear();
        ThreeUpdateCycleService.mockClear();
        ThreeViewerService.mockClear();
        CodeMapRenderService.mockClear();
    }

    function rebuild() {
        sut = new CodeMapMouseEventService(
            $rootScope,
            $window,
            new ThreeCameraService(),
            new ThreeRendererService(),
            new ThreeSceneService(),
            new ThreeUpdateCycleService(),
            new ThreeViewerService(),
            new CodeMapRenderService()
        );
    }

    it("constructor should subscribe to services", ()=>{
        expect(sut.threeUpdateCycleService.register).toHaveBeenCalled()
        expect(MapTreeViewLevelController.subscribeToHoverEvents).toHaveBeenCalled();
    });

    it("subscribe should bind listener to given events", ()=>{
        const listener: CodeMapMouseEventServiceSubscriber = {
            onBuildingHovered: ()=>{},
            onBuildingSelected: ()=>{}
        };
        CodeMapMouseEventService.subscribe($rootScope, listener);
        expect($rootScope.$on).toHaveBeenCalledWith("building-selected", expect.any(Function));
        expect($rootScope.$on).toHaveBeenCalledWith("building-hovered", expect.any(Function));
    });

    it("start should bind event listener", ()=>{
        sut.threeRendererService.renderer = {
            domElement: {
                addEventListener: jest.fn()
            }
        };
        const adder = sut.threeRendererService.renderer.domElement.addEventListener;
        sut.start();
        expect(adder).toHaveBeenCalledWith("mouseup", expect.any(Function), false);
        expect(adder).toHaveBeenCalledWith("mousedown", expect.any(Function), false);
        expect(adder).toHaveBeenCalledWith("mousemove", expect.any(Function), false);
        expect(adder).toHaveBeenCalledWith("dblclick", expect.any(Function), false);
    });

    it("onShouldHoverNode should not call onBuildingHovered when no buildings exist", ()=>{

        // given
        sut.onBuildingHovered = jest.fn();

        sut.codeMapRenderService.mapMesh = {
            getMeshDescription: jest.fn()
        }

        sut.codeMapRenderService.mapMesh.getMeshDescription.mockImplementation(() => {
            return {
                buildings: []
            };
        })

        // when
        sut.onShouldHoverNode({ path: "some path"} );

        // then
        expect(sut.onBuildingHovered).not.toHaveBeenCalled();

    });

    it("onShouldHoverNode should call onBuildingHovered when a building exists and the its path is equal to the nodes path", ()=>{

        // given

        const building = {
            node: {
                path: "some path"
            }
        }

        sut.onBuildingHovered = jest.fn();

        sut.hovered = null;

        sut.codeMapRenderService.mapMesh = {
            getMeshDescription: jest.fn()
        }

        sut.codeMapRenderService.mapMesh.getMeshDescription.mockImplementation(() => {
            return {
                buildings: [building]
            };
        })

        // when
        sut.onShouldHoverNode({ path: "some path"} );

        // then
        expect(sut.onBuildingHovered).toHaveBeenCalledWith(null, building);

    });

    it("onShouldHoverNode should not call onBuildingHovered when a building exists and the its path is not equal to the nodes path", ()=>{

        // given

        const building = {
            node: {
                path: "some other path"
            }
        }

        sut.onBuildingHovered = jest.fn();

        sut.codeMapRenderService.mapMesh = {
            getMeshDescription: jest.fn()
        }

        sut.codeMapRenderService.mapMesh.getMeshDescription.mockImplementation(() => {
            return {
                buildings: [building]
            };
        })

        // when
        sut.onShouldHoverNode({ path: "some path"} );

        // then
        expect(sut.onBuildingHovered).not.toHaveBeenCalled();

    });


    it("onShouldUnhoverNode should always call onBuildingHovered(something, null)", ()=>{

        // given

        const building = {
            node: {
                path: "some other path"
            }
        }

        sut.hovered = building;

        sut.onBuildingHovered = jest.fn();

        // when
        sut.onShouldUnhoverNode({ path: "some path"} );

        // then
        expect(sut.onBuildingHovered).toHaveBeenCalledWith(building, null);

    });


});