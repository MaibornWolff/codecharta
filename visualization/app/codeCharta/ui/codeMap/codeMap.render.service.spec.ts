import {CodeMapRenderService} from "./codeMap.render.service";
import {ThreeSceneService} from "./threeViewer/threeSceneService";
import {SettingsService} from "../../core/settings/settings.service";
import {TreeMapService} from "../../core/treemap/treemap.service";
import {CodeMapUtilService} from "./codeMap.util.service";
import {CodeMapNode} from "../../core/data/model/CodeMap";
import * as THREE from "three";
import {Group} from "three";
import sinon from "sinon";
import {CodeMapLabelService} from "./codeMap.label.service";
import {CodeMapArrowService} from "./codeMap.arrow.service";
jest.mock("./threeViewer/threeSceneService");


describe("renderService", () => {

    let renderService: CodeMapRenderService;
    let node: CodeMapNode;
    let threeSceneService: ThreeSceneService;
    let treeMapService: TreeMapService;
    let simpleHierarchy: Node;
    let codeMapUtilService: CodeMapUtilService;
    let settingsServiceMock: SettingsService;
    let $rootScope;
    let settingsService;

    beforeEach(() => {
        mockEverything();
    });


    function mockForGeometry(){
        node = codeMapUtilService.getCodeMapNodeFromPath("/root", "File");
        let nodes = renderService.collectNodesToArray(node);
        nodes[0].isLeaf = true;

        renderService.collectNodesToArray = jest.fn(x =>  nodes);
        renderService.threeSceneService = new ThreeSceneService();
        renderService.threeSceneService.labels = new Group();
        renderService.threeSceneService.edgeArrows = new Group();
        renderService.threeSceneService.mapGeometry =  new THREE.Group();

        const CodeMapLabelServiceMock = jest.fn<CodeMapLabelService>(() => ({
            clearLabels: jest.fn(),
            addLabel: jest.fn()
        }));

        renderService.codeMapLabelService = new CodeMapLabelServiceMock();
        renderService.codeMapArrowService = new CodeMapArrowService(renderService.threeSceneService);
    }

    function mockEverything(){
        $rootScope = {
            $on: jest.fn()
        };

        treeMapService = {
            setVisibilityOfNodeAndDescendants: jest.fn(),
            createTreemapNodes: jest.fn()
        };

        settingsService = {
            urlService: jest.fn(),
            dataService: jest.fn(),
            $rootScope,
            threeOrbitControlsService: jest.fn(),
            subscribe: jest.fn()
        };

        const neutralColorRange =jest.fn<Range>(() => ( {
            from: 0,
            to: 1,
            flipped: true
        }));

        simpleHierarchy = {
            name: "root",
            type: "Folder",
            path: "/root",
            height: 3,
            depth: 0,
            visible: true,
            length: 1,
            width: 1,
            attributes: {},
            children: [
                {
                    name: "a",
                    type: "Folder",
                    path: "/root/a",
                    height: 2,
                    depth: 1,
                    visible: true,
                    length: 1,
                    width: 1,
                    attributes: {},
                    children: [
                        {
                            name: "ab",
                            type: "Folder",
                            path: "/root/a/ab",
                            visible: true,
                            depth: 2,
                            attributes: {},
                            children: [
                                {
                                    name: "aba",
                                    path: "/root/a/ab/aba",
                                    isLeaf: true,
                                    visible: true,
                                    depth: 3,
                                    type: "File",
                                    attributes: {},
                                    children: []
                                }
                            ]
                        },
                    ]
                }
            ]
        };

        const SettingsServiceMock = jest.fn<SettingsService>(() => ({
            subscribe: jest.fn(),
            applySettings: jest.fn(),
            settings: {
                areaMetric: "areaMetric",
                heightMetric: "heightMetric",
                colorMetric: "colorMetric",
                neutralColorRange: neutralColorRange,
                amountOfTopLabels: 7,
                invertHeight: true,
                deltaColorFlipped: true,
                enableEdgeArrows: true,
                map: {
                    nodes: simpleHierarchy,
                    edges : [
                        {visible: true},
                        {visible: true}
                    ]
                },
                scaling: {
                    x: 1,
                    y: 1,
                    z: 1
                }
            }
        }));

        settingsServiceMock = new SettingsServiceMock();
        codeMapUtilService = new CodeMapUtilService(settingsServiceMock);

        threeSceneService = new ThreeSceneService();
        threeSceneService.mapGeometry = new Group();

        renderService = new CodeMapRenderService(threeSceneService, treeMapService, $rootScope, settingsService, codeMapUtilService);
    }




    describe("Building behaviour", () => {

        beforeEach(() => {
            renderService.updateMapGeometry = jest.fn();
        });

        it("Apply Settings", ()=>{
            renderService.scaleMap = jest.fn();
            let x = settingsServiceMock.settings.scaling.x;
            let y = settingsServiceMock.settings.scaling.y;
            let z = settingsServiceMock.settings.scaling.z;

            renderService.applySettings(settingsServiceMock.settings);

            expect(renderService.updateMapGeometry).toHaveBeenCalledWith(settingsServiceMock.settings);
            expect(renderService.scaleMap).toHaveBeenCalledWith(x,y,z);
        });

        it("Three Scene Map Mesh", ()=>{
            renderService.threeSceneService.getMapMesh = jest.fn(x => {renderService.mapMesh});

            renderService.applySettings(settingsServiceMock.settings);

            expect(renderService.threeSceneService.getMapMesh).toHaveBeenCalled();
        });

        it("Label scale", ()=>{
            renderService.codeMapLabelService = {
                scale: jest.fn()
            };

            renderService.applySettings(settingsServiceMock.settings);

            expect(renderService.codeMapLabelService.scale).toHaveBeenCalled();
        });

        it("Arrow scale", ()=>{
            renderService.codeMapArrowService = {
                scale: jest.fn()
            };

            renderService.applySettings(settingsServiceMock.settings);

            expect(renderService.codeMapArrowService.scale).toHaveBeenCalled();
        });

        it("Collect nodes", ()=>{
            node = codeMapUtilService.getCodeMapNodeFromPath("/root", "File");

            let nodes = renderService.collectNodesToArray(node);

            expect(nodes[0]).toBe(node);
            expect(nodes[1]).toBe(node.children[0]);
        });

        it("Apply settings", ()=>{
            renderService.applySettings = jest.fn();

            renderService.onSettingsChanged(settingsServiceMock.settings,null);

            expect(renderService.applySettings).toHaveBeenCalled();
        });

    });

    describe("Update geometry", () => {

        beforeEach(() => {
            mockForGeometry();

        });

        it("Nodes collected", ()=>{
            renderService.updateMapGeometry(settingsServiceMock.settings);

            expect(renderService.collectNodesToArray).toHaveBeenCalled();
        });


        it("Labels cleared", ()=>{
            renderService.codeMapLabelService.clearLabels = sinon.spy();
            renderService.updateMapGeometry(settingsServiceMock.settings);

            expect(renderService.codeMapLabelService.clearLabels.CalledOnce);

        });

        it("Arrows cleared", ()=>{
            renderService.codeMapArrowService.clearArrows = sinon.spy();
            renderService.updateMapGeometry(settingsServiceMock.settings);

            expect(renderService.codeMapArrowService.clearArrows.CalledOnce);

        });

        it("No visible edge", ()=>{


            settingsServiceMock.settings.map.edges = null;
            renderService.showCouplingArrows = sinon.spy();

            renderService.updateMapGeometry(settingsServiceMock.settings);
            expect(renderService.showCouplingArrows.CalledOnce);
        });

        it("MapMesh", ()=>{
            let mapMesh = renderService.mapMesh;

            expect(mapMesh).toBe(renderService._mapMesh);
        });
    });
});