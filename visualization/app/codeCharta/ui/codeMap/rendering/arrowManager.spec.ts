import {LabelManager} from "./labelManager";
import * as THREE from "three";
import {node, nodeAttributes} from "./node";
import {colorRange, renderSettings} from "./renderSettings";
import {Vector3} from "three";
import {ArrowManager} from "./arrowManager";

describe("ArrowManager", () => {

    let arrowManager: ArrowManager;
    let parent: THREE.Object3D;
    let createElementOrigin;

    let sampleRenderSettings: renderSettings;
    let sampleLeaf: node;
    let sampleLeaf2: node;
    let canvasCtxMock;

    beforeEach(()=>{

        sampleRenderSettings = {
            heightKey: "a",
            colorKey: "b",
            renderDeltas: false,
            colorRange: {
                from: 1,
                to: 2,
                flipped: false
            },
            mapSize: 500,
            deltaColorFlipped: false
        };

        sampleLeaf = {
            name: "sample",
            width: 1,
            height: 2,
            length: 3,
            depth: 4,
            x0: 5,
            z0: 6,
            y0: 7,
            isLeaf: true,
            deltas: {"a":1, "b":2},
            attributes: {"a":20, "b":15},
            children: [],
            isDelta: false
        };

        sampleLeaf2 = {
            name: "sample2",
            width: 1,
            height: 2,
            length: 3,
            depth: 4,
            x0: 5,
            z0: 6,
            y0: 7,
            isLeaf: true,
            deltas: {"a":1, "b":2},
            attributes: {"a":20, "b":15},
            children: [],
            isDelta: false
        };


        parent = new THREE.Object3D();
        arrowManager = new ArrowManager(parent);

        canvasCtxMock = {
            font: "",
            measureText: jest.fn(),
            fillRect: jest.fn(),
            fillText: jest.fn(),
            strokeRect: jest.fn()
        };

        createElementOrigin = document.createElement;

        document.createElement = ()=>{
            return {
                getContext: ()=>{
                    return canvasCtxMock;
                }
            };
        };

        canvasCtxMock.measureText.mockReturnValue({width: 10});

    });

    afterEach(()=>{
        document.createElement = createElementOrigin;
    });

    it("should have no arrows stored after construction", ()=>{
        expect(arrowManager.arrows.length).toBe(0);
    });

    it("should get correct path from node", ()=>{
        expect(arrowManager.getPathFromNode(sampleLeaf)).toBe("/sample");
        sampleLeaf.parent = sampleLeaf2;
        expect(arrowManager.getPathFromNode(sampleLeaf)).toBe("/sample2/sample");
    });

    it("should add no arrows when there are no edges", ()=>{
        arrowManager.addEdgeArrows([sampleLeaf], [], sampleRenderSettings);
        expect(arrowManager.arrows.length).toBe(0);
    });

    it("should add no arrows when there are no resolvable edges", ()=>{
        arrowManager.addEdgeArrows([sampleLeaf, sampleLeaf2], [{fromNodeName:"a", toNodeName: "b"}], sampleRenderSettings);
        expect(arrowManager.arrows.length).toBe(0);
    });

    it("should add arrows only from origin when there are resolvable edges", ()=>{
        arrowManager.addEdgeArrowsFromOrigin(sampleLeaf, [sampleLeaf, sampleLeaf2], [{fromNodeName:"/sample", toNodeName: "/sample2"}, {fromNodeName:"/sample2", toNodeName: "/sample2"}], sampleRenderSettings);
        expect(arrowManager.arrows.length).toBe(1);
    });

    it("should add arrows when there are resolvable edges", ()=>{
        arrowManager.addEdgeArrows([sampleLeaf, sampleLeaf2], [{fromNodeName:"/sample", toNodeName: "/sample2"}], sampleRenderSettings);
        expect(arrowManager.arrows.length).toBe(1);
    });

    it("should clear all arrows", ()=>{
        arrowManager.addEdgeArrows([sampleLeaf, sampleLeaf2], [{fromNodeName:"/sample", toNodeName: "/sample2"}], sampleRenderSettings);
        expect(arrowManager.arrows.length).toBe(1);
        arrowManager.clearArrows();
        expect(arrowManager.arrows.length).toBe(0);
    });

    it("addArrow should add arrow if node has a height attribute mentioned in renderSettings", ()=>{
        arrowManager.addArrow(sampleLeaf, sampleLeaf, sampleRenderSettings);
        expect(arrowManager.arrows.length).toBe(1);
    });

    it("addArrow should not add arrow if node has not a height attribute mentioned in renderSettings", ()=>{
        sampleLeaf.attributes = {"notsome": 0};
        sampleRenderSettings.heightKey = "some";
        arrowManager.addArrow(sampleLeaf, sampleLeaf, sampleRenderSettings);
        expect(arrowManager.arrows.length).toBe(0);
    });


});