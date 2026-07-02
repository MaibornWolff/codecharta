import { scaling } from "./scaling.reducer"
import { setScaling } from "./scaling.actions"

describe("scaling", () => {
    it("should set new scaling", () => {
        const result = scaling({ x: 1, y: 1, z: 1 }, setScaling({ value: { x: 2, y: 2, z: 2 } }))

        expect(result).toEqual({ x: 2, y: 2, z: 2 })
    })

    it("should update partial scaling", () => {
        const result = scaling({ x: 2, y: 2, z: 2 }, setScaling({ value: { y: 1 } }))

        expect(result).toEqual({ x: 2, y: 1, z: 2 })
    })
})
