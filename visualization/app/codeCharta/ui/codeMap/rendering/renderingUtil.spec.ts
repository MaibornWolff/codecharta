import {RenderingUtil} from "./renderingUtil";
import * as THREE from "three";

describe("renderingUtil", () => {

    it("0x000000 should return 0,0,0", ()=>{
        const vec: THREE.Vector3 = RenderingUtil.colorToVec3("#000000");
        expect(vec.x).toBe(0);
        expect(vec.y).toBe(0);
        expect(vec.z).toBe(0);
    });

    it("0xffffff should return 1,1,1", ()=>{
        const vec: THREE.Vector3 = RenderingUtil.colorToVec3("#FFFFFF");
        expect(vec.x).toBe(1);
        expect(vec.y).toBe(1);
        expect(vec.z).toBe(1);
    });

    it("0xff00aa should be close to 1,0,0.666", ()=>{
        const vec: THREE.Vector3 = RenderingUtil.colorToVec3("#FF00AA");
        expect(vec.x).toBe(1);
        expect(vec.y).toBe(0);
        expect(vec.z).toBeCloseTo(0.666,2);
    });

});