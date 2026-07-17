import { setIsLoadingFile } from "./isLoadingFile.actions"
import { isLoadingFile } from "./isLoadingFile.reducer"

describe("isLoadingFile", () => {
    it("should set new isLoadingFile", () => {
        const result = isLoadingFile(true, setIsLoadingFile({ value: false }))

        expect(result).toEqual(false)
    })
})
