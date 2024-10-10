import { ViewCubemeshGenerator } from "./viewCube.meshGenerator"
import { Group } from "three"

describe("ViewCubemeshGenerator", () => {
    it("should build a cube made up from the group and json for the top and side meshes", () => {
        const edgeToFaceRatio = 1.9
        const result = ViewCubemeshGenerator.buildCube(edgeToFaceRatio)

        expect(result).toHaveProperty("group")
        expect(result.group).toBeInstanceOf(Group)
        expect(result.top).toBeDefined()
        expect(result.sides).toBeDefined()
    })

    it("should define all nine top elements", () => {
        const edgeToFaceRatio = 1.9
        const result = ViewCubemeshGenerator.buildCube(edgeToFaceRatio)

        const top = result.top

        expect(top.front.left).toBeDefined()
        expect(top.front.center).toBeDefined()
        expect(top.front.right).toBeDefined()

        expect(top.middle.left).toBeDefined()
        expect(top.middle.center).toBeDefined()
        expect(top.middle.right).toBeDefined()

        expect(top.back.left).toBeDefined()
        expect(top.back.center).toBeDefined()
        expect(top.back.right).toBeDefined()
    })

    it("should define all eight side elements", () => {
        const edgeToFaceRatio = 1.9
        const result = ViewCubemeshGenerator.buildCube(edgeToFaceRatio)

        const sides = result.sides

        expect(sides.front.left).toBeDefined()
        expect(sides.front.center).toBeDefined()
        expect(sides.front.right).toBeDefined()

        expect(sides.middle.left).toBeDefined()
        expect(sides.middle.right).toBeDefined()

        expect(sides.back.left).toBeDefined()
        expect(sides.back.center).toBeDefined()
        expect(sides.back.right).toBeDefined()
    })
})
