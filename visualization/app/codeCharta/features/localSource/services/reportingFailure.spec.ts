import { ToastService } from "../../shared/facade"
import { reportingFailure } from "./reportingFailure"

describe("reportingFailure", () => {
    const toast = { show: jest.fn() } as unknown as ToastService

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should hand back what the work returns", async () => {
        // Act
        const result = await reportingFailure(toast, "Could not do it", async () => 42)

        // Assert
        expect(result).toBe(42)
        expect(toast.show).not.toHaveBeenCalled()
    })

    it("should show a failure and hand back null", async () => {
        // Act
        const result = await reportingFailure(toast, "Could not do it", async () => {
            throw new Error("storage gone")
        })

        // Assert
        expect(result).toBeNull()
        expect(toast.show).toHaveBeenCalledWith("Could not do it: storage gone", "error")
    })

    it("should show a generic reason when the thrown value is not an error", async () => {
        // Act
        const result = await reportingFailure(toast, "Could not do it", () => Promise.reject("storage gone"))

        // Assert
        expect(result).toBeNull()
        expect(toast.show).toHaveBeenCalledWith("Could not do it: unknown error", "error")
    })
})
