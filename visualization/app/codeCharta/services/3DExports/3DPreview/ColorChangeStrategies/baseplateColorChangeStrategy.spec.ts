import { BaseplateMesh } from "../MeshModels/baseplateMesh";
import { BaseplateColorChangeStrategy } from "./baseplateColorChangeStrategy";
import { Shader, ShaderMaterial } from "three";

describe("BaseplateColorChangeStrategy", () => {
    let strategy;
    let mesh: BaseplateMesh;

    beforeEach(() => {
        strategy = new BaseplateColorChangeStrategy();
        mesh = new BaseplateMesh();
        mesh.material = new ShaderMaterial();
    });

    it("should return true and set color to [1, 1, 1] when numberOfColors is 1", () => {
        const result = strategy.execute(1, mesh);
        expect(result).toBe(true);
        expect((mesh.material as ShaderMaterial).defaultAttributeValues.color).toEqual([1, 1, 1]);
    });

    it("should return true and set color to [0.5, 0.5, 0.5] when numberOfColors is not 1", () => {
        const result = strategy.execute(2, mesh);
        expect(result).toBe(true);
        expect((mesh.material as ShaderMaterial).defaultAttributeValues.color).toEqual([0.5, 0.5, 0.5]);
    });

    it("should return true and set color to [0.5, 0.5, 0.5] when numberOfColors is 0", () => {
        const result = strategy.execute(0, mesh);
        expect(result).toBe(true);
        expect((mesh.material as ShaderMaterial).defaultAttributeValues.color).toEqual([0.5, 0.5, 0.5]);
    });

    it("should return true and set color to [0.5, 0.5, 0.5] when numberOfColors is greater than 1", () => {
        const result = strategy.execute(3, mesh);
        expect(result).toBe(true);
        expect((mesh.material as ShaderMaterial).defaultAttributeValues.color).toEqual([0.5, 0.5, 0.5]);
    });
});
