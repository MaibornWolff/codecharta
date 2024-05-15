import { findIndexOfMarkedPackageOrParent } from "./findIndexOfMarkedPackageOrParent"

describe("findIndexOfMarkedPackageOrParent", () => {
    it("should return -1 if given path is neither marked nor a child of a marked package", () => {
        expect(
            findIndexOfMarkedPackageOrParent(
                [
                    { path: "/root/child/grandchild", color: "#ffffff" },
                    { path: "/root/child", color: "#000000" }
                ],
                "/root/wolf"
            )
        ).toBe(-1)
    })

    it("should find exact package even if a children was marked previously", () => {
        expect(
            findIndexOfMarkedPackageOrParent(
                [
                    { path: "/root/child/grandchild", color: "#ffffff" },
                    { path: "/root/child", color: "#000000" }
                ],
                "/root/child"
            )
        ).toBe(1)
    })

    it("should find closest parent if given path is not marked", () => {
        expect(
            findIndexOfMarkedPackageOrParent(
                [
                    { path: "/root/child", color: "#000000" },
                    { path: "/root/child/grandchild", color: "#ffffff" }
                ],
                "/root/child/grandchild/grandgrandchild"
            )
        ).toBe(1)
    })
})
