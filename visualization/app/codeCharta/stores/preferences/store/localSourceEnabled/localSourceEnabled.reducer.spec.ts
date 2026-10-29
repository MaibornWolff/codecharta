import { setLocalSourceEnabled } from "./localSourceEnabled.actions"
import { defaultLocalSourceEnabled, localSourceEnabled } from "./localSourceEnabled.reducer"

describe("localSourceEnabled", () => {
    it("should keep local source files closed until the reader opens them", () => {
        // Act
        const result = localSourceEnabled(undefined, { type: "@@INIT" })

        // Assert
        expect(result).toBe(defaultLocalSourceEnabled)
        expect(result).toBe(false)
    })

    it("should open local source files once the reader switches them on", () => {
        // Act
        const result = localSourceEnabled(false, setLocalSourceEnabled({ value: true }))

        // Assert
        expect(result).toBe(true)
    })
})
