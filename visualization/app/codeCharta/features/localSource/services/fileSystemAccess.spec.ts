import { findFile, hasReadPermission, isFolderPickerSupported, pickFolder } from "./fileSystemAccess"
import { fakeDirectory } from "./fileSystemAccess.mocks"

describe("fileSystemAccess", () => {
    afterEach(() => {
        delete (window as unknown as { showDirectoryPicker?: unknown }).showDirectoryPicker
    })

    function givenPicker(picker: jest.Mock) {
        ;(window as unknown as { showDirectoryPicker: jest.Mock }).showDirectoryPicker = picker
    }

    describe("isFolderPickerSupported", () => {
        it("should not be supported where the browser lacks the folder picker", () => {
            // Act
            const isSupported = isFolderPickerSupported()

            // Assert
            expect(isSupported).toBe(false)
        })

        it("should be supported where the browser has the folder picker", () => {
            // Arrange
            givenPicker(jest.fn())

            // Act
            const isSupported = isFolderPickerSupported()

            // Assert
            expect(isSupported).toBe(true)
        })
    })

    describe("pickFolder", () => {
        it("should return the chosen folder read-only", async () => {
            // Arrange
            const directory = fakeDirectory("myproject", {})
            const picker = jest.fn().mockResolvedValue(directory)
            givenPicker(picker)

            // Act
            const pickedFolder = await pickFolder()

            // Assert
            expect(pickedFolder).toBe(directory)
            expect(picker).toHaveBeenCalledWith(expect.objectContaining({ mode: "read" }))
        })

        it("should return null when the user cancels the picker", async () => {
            // Arrange
            givenPicker(jest.fn().mockRejectedValue(new DOMException("cancelled", "AbortError")))

            // Act
            const pickedFolder = await pickFolder()

            // Assert
            expect(pickedFolder).toBeNull()
        })

        it("should pass on any other failure", async () => {
            // Arrange
            givenPicker(jest.fn().mockRejectedValue(new DOMException("no gesture", "SecurityError")))

            // Act
            const picking = pickFolder()

            // Assert
            await expect(picking).rejects.toThrow("no gesture")
        })
    })

    describe("hasReadPermission", () => {
        it("should not ask again when reading is already granted", async () => {
            // Arrange
            const directory = fakeDirectory("myproject", {}, "granted")

            // Act
            const isReadable = await hasReadPermission(directory)

            // Assert
            expect(isReadable).toBe(true)
            expect(directory.requestPermission).not.toHaveBeenCalled()
        })

        it("should ask when reading is not granted yet", async () => {
            // Arrange
            const directory = fakeDirectory("myproject", {}, "prompt")
            jest.mocked(directory.requestPermission).mockResolvedValue("granted")

            // Act
            const isReadable = await hasReadPermission(directory)

            // Assert
            expect(isReadable).toBe(true)
        })

        it("should not be readable when the user denies it", async () => {
            // Arrange
            const directory = fakeDirectory("myproject", {}, "denied")

            // Act
            const isReadable = await hasReadPermission(directory)

            // Assert
            expect(isReadable).toBe(false)
        })
    })

    describe("findFile", () => {
        const directory = fakeDirectory("myproject", { src: { "Foo.kt": "class Foo" }, "README.md": "# Readme" })

        it("should find a file in a sub folder", async () => {
            // Act
            const file = await findFile(directory, "src/Foo.kt")

            // Assert
            expect(await file.text()).toBe("class Foo")
        })

        it("should return null for a missing file", async () => {
            // Act
            const file = await findFile(directory, "src/Bar.kt")

            // Assert
            expect(file).toBeNull()
        })

        it("should return null when a folder on the way is a file", async () => {
            // Act
            const file = await findFile(directory, "README.md/Foo.kt")

            // Assert
            expect(file).toBeNull()
        })

        it("should return null for an empty path", async () => {
            // Act
            const file = await findFile(directory, "")

            // Assert
            expect(file).toBeNull()
        })

        it("should pass on failures other than a missing file", async () => {
            // Arrange
            const brokenDirectory = fakeDirectory("broken", {})
            jest.mocked(brokenDirectory.getFileHandle).mockRejectedValue(new Error("disk gone"))

            // Act
            const finding = findFile(brokenDirectory, "Foo.kt")

            // Assert
            await expect(finding).rejects.toThrow("disk gone")
        })
    })
})
