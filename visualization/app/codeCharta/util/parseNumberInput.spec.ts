import { parseNumberInput } from "./parseNumberInput"

describe("parseNumberInput", () => {
    it("should get value", () => {
        const fakeEvent = { target: { value: 42 } } as unknown as InputEvent
        expect(parseNumberInput(fakeEvent, 0, 100)).toBe(42)
    })

    it("should return min value in case of too small entered valued", () => {
        const fakeEvent = { target: { value: 1 } } as unknown as InputEvent
        expect(parseNumberInput(fakeEvent, 2, 100)).toBe(2)
    })

    it("should return max value in case of too large entered valued", () => {
        const fakeEvent = { target: { value: 9999 } } as unknown as InputEvent
        expect(parseNumberInput(fakeEvent, 0, 9000)).toBe(9000)
    })
})
