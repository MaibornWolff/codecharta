import { getReadableColorForBackground } from "./getReadableColorForBackground"

describe("getReadableColorForBackground", () => {
    it("should decide 'black' for orange", () => {
        expect(getReadableColorForBackground("#ffa500")).toBe("black")
    })

    it("should decide 'white' for red", () => {
        expect(getReadableColorForBackground("ff0000")).toBe("white")
    })
})
