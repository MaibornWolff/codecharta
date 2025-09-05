import { IsNodeFocusedPipe } from "./isNodeFocused.pipe"

describe("isNodeFocused pipe", () => {
    it("should return not focused if there is no focused node path", () => {
        expect(new IsNodeFocusedPipe().transform(undefined, { path: "/root" })).toEqual({
            isNodeFocused: false,
            isParentFocused: false
        })
    })

    it("should return not focused if focused node path isn't given node nor a parent", () => {
        expect(new IsNodeFocusedPipe().transform("root/foo", { path: "/root/bar" })).toEqual({
            isNodeFocused: false,
            isParentFocused: false
        })
    })

    it("should mark node as focused", () => {
        expect(new IsNodeFocusedPipe().transform("/root/foo", { path: "/root/foo" })).toEqual({
            isNodeFocused: true,
            isParentFocused: false
        })
    })

    it("should mark parent as focused", () => {
        expect(new IsNodeFocusedPipe().transform("/root/foo", { path: "/root/foo/bar" })).toEqual({
            isNodeFocused: false,
            isParentFocused: true
        })
    })
})
