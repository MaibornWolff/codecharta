import { FileSelectionState } from "../../../model/files/files"
import { _getReferenceFile } from "./referenceFile.selector"

describe("referenceFileSelector", () => {
    it("should return undefined when there is no file selected as reference", () => {
        const files = [
            { selectedAs: FileSelectionState.Partial, file: "file1" },
            { selectedAs: FileSelectionState.Partial, file: "file2" }
        ]
        expect(_getReferenceFile(files)).toBe(undefined)
    })

    it("should return reference File", () => {
        const files = [
            { selectedAs: FileSelectionState.Comparison, file: "file1" },
            { selectedAs: FileSelectionState.Reference, file: "file2" }
        ]
        expect(_getReferenceFile(files)).toBe("file2")
    })
})
