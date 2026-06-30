import { searchPattern } from "./searchPattern.reducer"
import { setSearchPattern } from "./searchPattern.actions"
import { setStandard } from "../../../../fileStore/store/files.actions"

describe("searchPattern", () => {
    it("should set new searchPattern", () => {
        const result = searchPattern("", setSearchPattern({ value: "mySearch/*.ts" }))
        expect(result).toEqual("mySearch/*.ts")
    })

    it("should reset searchPattern on FilesSelectionActions", () => {
        const result = searchPattern("mySearch/*.ts", setStandard({ files: [] }))
        expect(result).toBe("")
    })
})
