import { _getMarkFolderItems } from "./markFolderItems.selector"

describe("markFolderItemsSelector's _getMarkFolderItems", () => {
    it("should return all colors as unmarked if no node is given", () => {
        expect(_getMarkFolderItems(null, ["#000000", "#ffffff"], [])).toEqual([
            { color: "#000000", isMarked: false },
            { color: "#ffffff", isMarked: false }
        ])
    })

    it("should recognized a marked folder", () => {
        expect(_getMarkFolderItems({ path: "/root" }, ["#000000", "#ffffff"], [{ color: "#000000", path: "/root" }])).toEqual([
            { color: "#000000", isMarked: true },
            { color: "#ffffff", isMarked: false }
        ])
    })
})
