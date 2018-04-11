import {LabelManager} from "./labelManager";
import * as THREE from "three";
import {node, nodeAttributes} from "./node";
import {colorRange, renderSettings} from "./renderSettings";
import {Vector3} from "three";

describe("LabelManager", () => {

    let labelManager: LabelManager;
    let parent: THREE.Object3D;
    let createElementOrigin;

    let sampleRenderSettings: renderSettings;
    let sampleLeaf: node;
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

        parent = new THREE.Object3D();
        labelManager = new LabelManager(parent);

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

    it("should have no labels stored after construction", ()=>{
        expect(labelManager.labels.length).toBe(0);
    });

    it("addLabel should add label if node has a height attribute mentioned in renderSettings", ()=>{
        labelManager.addLabel(sampleLeaf, sampleRenderSettings);
        expect(labelManager.labels.length).toBe(1);
    });

    it("addLabel should not add label if node has not a height attribute mentioned in renderSettings", ()=>{
        sampleLeaf.attributes = {"notsome": 0};
        sampleRenderSettings.heightKey = "some";
        labelManager.addLabel(sampleLeaf, sampleRenderSettings);
        expect(labelManager.labels.length).toBe(0);
    });

    it("addLabel should calculate correct height without delta", ()=>{
        labelManager.addLabel(sampleLeaf, sampleRenderSettings);
        let positionWithoutDelta: Vector3 = labelManager.labels[0].sprite.position;
        expect(positionWithoutDelta.y).toBe(88);
    });

    it("clearLabel should clear parent in scene and internal labels", ()=>{
        labelManager.clearLabels();
        expect(parent.children.length).toBe(0);
        expect(labelManager.labels.length).toBe(0);
    });

    it("scaling existing labels should scale their position correctly", ()=>{

        const SX = 1;
        const SY = 2;
        const SZ = 3;

        labelManager.addLabel(sampleLeaf, sampleRenderSettings);
        labelManager.addLabel(sampleLeaf, sampleRenderSettings);

        const scaleBeforeA: Vector3 = new Vector3(
            labelManager.labels[0].sprite.position.x,
            labelManager.labels[0].sprite.position.y,
            labelManager.labels[0].sprite.position.z
        );

        const scaleBeforeB: Vector3 = new Vector3(
            labelManager.labels[1].sprite.position.x,
            labelManager.labels[1].sprite.position.y,
            labelManager.labels[1].sprite.position.z
        );

        labelManager.scale(SX,SY,SZ);

        const scaleAfterA: Vector3 = labelManager.labels[0].sprite.position;
        const scaleAfterB: Vector3 = labelManager.labels[1].sprite.position;

        expect(scaleAfterA.x).toBe(scaleBeforeA.x * SX);
        expect(scaleAfterA.y).toBe(scaleBeforeA.y * SY);
        expect(scaleAfterA.z).toBe(scaleBeforeA.z * SZ);

        expect(scaleAfterB.x).toBe(scaleBeforeB.x * SX);
        expect(scaleAfterB.y).toBe(scaleBeforeB.y * SY);
        expect(scaleAfterB.z).toBe(scaleBeforeB.z * SZ);

    });

});