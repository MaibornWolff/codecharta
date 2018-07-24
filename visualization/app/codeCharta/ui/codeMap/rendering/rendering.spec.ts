import {intermediateVertexData} from "./intermediateVertexData";
import * as THREE from "three";
import {codeMapShaderStrings} from "./codeMapShaderStrings";
import {codeMapBuilding} from "./codeMapBuilding";
import {MapColors} from "./renderSettings";

describe("common rendering tests", () => {

    describe("codeMapBuilding", () => {

        it("init", () => {
            let cmb: codeMapBuilding = new codeMapBuilding(0, new THREE.Box3(), {});
            expect(cmb.color).toBe(MapColors.defaultC);
        });

    });

    describe("shader strings", () => {

        it("init", () => {
            let cmss: codeMapShaderStrings = new codeMapShaderStrings();
            expect(cmss.fragmentShaderCode).toMatchSnapshot();
            expect(cmss.vertexShaderCode).toMatchSnapshot();
        });

    });


    describe("intermediate vertex data", () => {

        it("addFace", () => {
            let ivd: intermediateVertexData = new intermediateVertexData();
            ivd.addFace(0, 1, 2);
            expect(ivd.indices.length).toBe(3);
            expect(ivd.indices).toEqual([0, 1, 2]);
            ivd.addFace(2, 3, 7);
            expect(ivd.indices.length).toBe(6);
            expect(ivd.indices).toEqual([0, 1, 2, 2, 3, 7]);
        });

        it("addVertex", () => {
            let ivd: intermediateVertexData = new intermediateVertexData();
            let res = ivd.addVertex(
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(1, 0, 0),
                new THREE.Vector2(2, 2),
                new THREE.Color(0, 0, 0),
                3,
                20);
            expect(ivd.indices.length).toBe(0);
            expect(ivd.positions.length).toBe(1);
            expect(ivd.normals.length).toBe(1);
            expect(ivd.uvs.length).toBe(1);
            expect(ivd.colors.length).toBe(1);
            expect(ivd.subGeometryIdx.length).toBe(1);
            expect(ivd.deltas.length).toBe(1);
            expect(res).toBe(0);
        });

    });

});