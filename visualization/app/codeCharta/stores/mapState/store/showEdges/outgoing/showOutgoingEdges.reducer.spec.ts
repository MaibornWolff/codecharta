import { setShowOutgoingEdges } from "./showOutgoingEdges.actions"
import { showOutgoingEdges } from "./showOutgoingEdges.reducer"

describe("showOutgoingEdges", () => {
    it("should set new showOutgoingEdges", () => {
        const result = showOutgoingEdges(false, setShowOutgoingEdges({ value: true }))

        expect(result).toBeTruthy()
    })
})
