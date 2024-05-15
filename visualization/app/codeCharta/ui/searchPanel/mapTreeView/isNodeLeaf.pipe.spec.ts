import { CodeMapNode } from "../../../codeCharta.model"
import { IsNodeLeafPipe } from "./isNodeLeaf.pipe"

describe("IsNodeLeafPipe", () => {
    it("should be true if node is a leaf", () => {
        const fakeNode = {} as unknown as CodeMapNode
        expect(new IsNodeLeafPipe().transform(fakeNode)).toBeTruthy()
    })

    it("should be false if node is a folder", () => {
        const fakeNode = { children: [{}] } as unknown as CodeMapNode
        expect(new IsNodeLeafPipe().transform(fakeNode)).toBeFalsy()
    })
})
