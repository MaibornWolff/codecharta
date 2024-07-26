import { FrontPrintColorChangeStrategy } from "./frontPrintColorChangeStrategy"

describe("FrontPrintColorChangeStrategy", () => {
    let strategy
    let mesh

    beforeEach(() => {
        strategy = new FrontPrintColorChangeStrategy()
        mesh = {
            material: {
                color: {
                    setRGB: jest.fn()
                }
            }
        }
    })

    it("should return true and set color to [1, 1, 1] when numberOfColors is less than 4", () => {
        const result = strategy.execute(3, mesh)
        expect(result).toBe(true)
        expect(mesh.material.color.setRGB).toHaveBeenCalledWith(1, 1, 1)
    })

    it("should return true and set color to [1, 1, 0] when numberOfColors is exactly 4", () => {
        const result = strategy.execute(4, mesh)
        expect(result).toBe(true)
        expect(mesh.material.color.setRGB).toHaveBeenCalledWith(1, 1, 0)
    })

    it("should return true and set color to [1, 1, 1] when numberOfColors is greater than 4", () => {
        const result = strategy.execute(5, mesh)
        expect(result).toBe(true)
        expect(mesh.material.color.setRGB).toHaveBeenCalledWith(1, 1, 1)
    })

    it("should return true and set color to [1, 1, 1] when numberOfColors is 1", () => {
        const result = strategy.execute(1, mesh)
        expect(result).toBe(true)
        expect(mesh.material.color.setRGB).toHaveBeenCalledWith(1, 1, 1)
    })

    it("should return true and set color to [1, 1, 1] when numberOfColors is 0", () => {
        const result = strategy.execute(0, mesh)
        expect(result).toBe(true)
        expect(mesh.material.color.setRGB).toHaveBeenCalledWith(1, 1, 1)
    })
})
