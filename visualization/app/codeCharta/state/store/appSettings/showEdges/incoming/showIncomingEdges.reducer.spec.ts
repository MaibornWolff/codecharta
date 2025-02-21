import { showIncomingEdges } from "./showIncomingEdges.reducer"
import { setShowIncomingEdges } from "./showIncomingEdges.actions"

describe("showIncomingEdges", () => {
    it("should set new showIncomingEdges", () => {
        const result = showIncomingEdges(false, setShowIncomingEdges({ value: true }))

        expect(result).toBeTruthy()
    })
})
