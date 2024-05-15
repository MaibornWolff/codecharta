import { isPresentationMode } from "./isPresentationMode.reducer"
import { setPresentationMode } from "./isPresentationMode.actions"

describe("isPresentationMode", () => {
    it("should activate presentation mode", () => {
        const result = isPresentationMode(false, setPresentationMode({ value: true }))

        expect(result).toBeTruthy()
    })
})
