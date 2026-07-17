import { setPresentationMode } from "./isPresentationMode.actions"
import { isPresentationMode } from "./isPresentationMode.reducer"

describe("isPresentationMode", () => {
    it("should activate presentation mode", () => {
        const result = isPresentationMode(false, setPresentationMode({ value: true }))

        expect(result).toBeTruthy()
    })
})
