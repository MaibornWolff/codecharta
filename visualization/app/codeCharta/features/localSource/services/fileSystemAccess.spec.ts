import { canOpenFoldersHere, FolderAccessBlockedError, findFile, hasReadPermission, pickFolder } from "./fileSystemAccess"
import { fakeDirectory } from "./fileSystemAccess.mocks"

describe("fileSystemAccess", () => {
    afterEach(() => {
        delete (window as unknown as { showDirectoryPicker?: unknown }).showDirectoryPicker
    })

    function givenPicker(picker: jest.Mock) {
        ;(window as unknown as { showDirectoryPicker: jest.Mock }).showDirectoryPicker = picker
    }

    describe("canOpenFoldersHere", () => {
        const ORIGIN = "https://codecharta.example"

        function aPage({ hasPicker = true, frame = "none" }: { hasPicker?: boolean; frame?: "none" | "sameOrigin" | "otherOrigin" }) {
            const page = { location: { origin: ORIGIN } } as unknown as Window & Record<string, unknown>
            if (hasPicker) {
                page.showDirectoryPicker = jest.fn()
            }
            const parent = {
                get location(): { origin: string } {
                    if (frame === "otherOrigin") {
                        throw new DOMException("Blocked a frame with origin from accessing a cross-origin frame.", "SecurityError")
                    }
                    return { origin: ORIGIN }
                }
            }
            Object.assign(page, { self: page, top: frame === "none" ? page : parent })
            return page
        }

        it.each([
            ["Chrome, Edge and other Chromium browsers on their own page", aPage({}), true],
            ["the desktop app, which runs Chromium", aPage({}), true],
            ["a frame of the same origin, such as CodeCharta embedding itself", aPage({ frame: "sameOrigin" }), true],
            ["Firefox, Safari and mobile browsers, which have no folder picker", aPage({ hasPicker: false }), false],
            ["a page served without https, which gets no folder picker", aPage({ hasPicker: false }), false],
            ["a frame of another origin, which may not show the picker", aPage({ frame: "otherOrigin" }), false]
        ])("should tell for %s whether folders can be opened", (_case, page, canOpen) => {
            // Act
            const answer = canOpenFoldersHere(page)

            // Assert
            expect(answer).toBe(canOpen)
        })

        it("should ask the page it runs in by default", () => {
            // Arrange
            givenPicker(jest.fn())

            // Act
            const answer = canOpenFoldersHere()

            // Assert
            expect(answer).toBe(true)
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

        it.each([
            "SecurityError",
            "NotAllowedError"
        ])("should report a picker forbidden by a policy or the embedding (%s) as blocked", async errorName => {
            // Arrange
            givenPicker(jest.fn().mockRejectedValue(new DOMException("forbidden", errorName)))

            // Act
            const picking = pickFolder()

            // Assert
            await expect(picking).rejects.toBeInstanceOf(FolderAccessBlockedError)
        })

        it("should pass on any other failure", async () => {
            // Arrange
            givenPicker(jest.fn().mockRejectedValue(new TypeError("picker broken")))

            // Act
            const picking = pickFolder()

            // Assert
            await expect(picking).rejects.toThrow("picker broken")
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

        it("should return null for a name this system's folders cannot hold", async () => {
            // Arrange
            const refusingDirectory = {
                getFileHandle: jest.fn().mockRejectedValue(new TypeError("Name is not allowed"))
            } as unknown as FileSystemDirectoryHandle

            // Act
            const file = await findFile(refusingDirectory, "a\\b.kt")

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
