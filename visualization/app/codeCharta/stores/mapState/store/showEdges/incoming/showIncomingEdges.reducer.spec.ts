import { setShowIncomingEdges } from "./showIncomingEdges.actions"
import { showIncomingEdges } from "./showIncomingEdges.reducer"

describe("showIncomingEdges", () => {
    it("should set new showIncomingEdges", () => {
        const result = showIncomingEdges(false, setShowIncomingEdges({ value: true }))

        expect(result).toBeTruthy()
    })
})
