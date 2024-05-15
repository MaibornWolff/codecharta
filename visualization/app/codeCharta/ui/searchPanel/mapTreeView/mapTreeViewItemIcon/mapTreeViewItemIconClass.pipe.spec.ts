import { CodeMapNode } from "../../../../codeCharta.model"
import { MapTreeViewItemIconClassPipe } from "./mapTreeViewItemIconClass.pipe"

describe("MapTreeViewItemIconClassPipe", () => {
    it("should return 'fa fa-file-o' for leaf nodes", () => {
        const fakeNode = {} as unknown as CodeMapNode
        expect(new MapTreeViewItemIconClassPipe().transform(fakeNode, true)).toBe("fa fa-file-o")
    })

    it("should return 'fa fa-folder-open' for open folders", () => {
        const fakeNode = { children: [{}] } as unknown as CodeMapNode
        expect(new MapTreeViewItemIconClassPipe().transform(fakeNode, true)).toBe("fa fa-folder-open")
    })

    it("should return 'fa fa-folder' for closed folders", () => {
        const fakeNode = { children: [{}] } as unknown as CodeMapNode
        expect(new MapTreeViewItemIconClassPipe().transform(fakeNode, false)).toBe("fa fa-folder")
    })
})
