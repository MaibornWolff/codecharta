import { _mapColors2pictogramColors } from "./pictogramBackground.selector"

describe("pictogramBackgroundSelector", () => {
    it("should return a 50/50 linear-gradient", () => {
        expect(_mapColors2pictogramColors({ positiveDelta: "#000000", negativeDelta: "#ffffff" })).toBe(
            "linear-gradient(#000000 50%, #ffffff 50%)"
        )
    })
})
