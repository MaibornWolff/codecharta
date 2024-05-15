import { isLoadingFile } from "./isLoadingFile.reducer"
import { setIsLoadingFile } from "./isLoadingFile.actions"

describe("isLoadingFile", () => {
    it("should set new isLoadingFile", () => {
        const result = isLoadingFile(true, setIsLoadingFile({ value: false }))

        expect(result).toEqual(false)
    })
})
