import { LocalStorageRepo } from "./localStorage.repo"

describe("LocalStorageRepo", () => {
    const blockedStorage = () => {
        throw new DOMException("The operation is insecure.", "SecurityError")
    }

    beforeEach(() => {
        localStorage.clear()
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it("should read back what it wrote, and nothing for a key never written", () => {
        // Arrange
        const repo = new LocalStorageRepo()

        // Act
        repo.write("width", "480")

        // Assert
        expect(repo.read("width")).toBe("480")
        expect(repo.read("height")).toBeNull()
    })

    it("should read nothing where the browser blocks the storage", () => {
        // Arrange
        jest.spyOn(Storage.prototype, "getItem").mockImplementation(blockedStorage)

        // Act
        const read = new LocalStorageRepo().read("width")

        // Assert
        expect(read).toBeNull()
    })

    it("should let a value go that the browser does not let it write", () => {
        // Arrange
        jest.spyOn(Storage.prototype, "setItem").mockImplementation(blockedStorage)
        const repo = new LocalStorageRepo()

        // Act
        const write = () => repo.write("width", "480")

        // Assert
        expect(write).not.toThrow()
        expect(repo.read("width")).toBeNull()
    })
})
