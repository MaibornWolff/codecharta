import { compareVersion } from "./compareVersion"

describe("compareVersion", () => {
    it("should return 0 when versions are equal", () => {
        expect(compareVersion("1.42.0", "1.42.0")).toBe(0)
    })

    it("should return 1 when first version has higher major version", () => {
        expect(compareVersion("2.41.0", "1.43.1")).toBe(1)
    })

    it("should return 1 when first version has higher minor version", () => {
        expect(compareVersion("1.42.0", "1.41.1")).toBe(1)
    })

    it("should return 1 when first version has higher patch version", () => {
        expect(compareVersion("1.42.1", "1.42.0")).toBe(1)
    })

    it("should return -1 when second version has higher major version", () => {
        expect(compareVersion("1.43.1", "2.41.0")).toBe(-1)
    })

    it("should return -1 when second version has higher minor version", () => {
        expect(compareVersion("1.41.1", "1.42.0")).toBe(-1)
    })

    it("should return -1 when second version has higher patch version", () => {
        expect(compareVersion("1.42.0", "1.42.1")).toBe(-1)
    })
})
