import { showOutgoingEdges } from "./showOutgoingEdges.reducer"
import { setShowOutgoingEdges } from "./showOutgoingEdges.actions"

describe("showOutgoingEdges", () => {
    it("should set new showOutgoingEdges", () => {
        const result = showOutgoingEdges(false, setShowOutgoingEdges({ value: true }))

        expect(result).toBeTruthy()
    })
})
