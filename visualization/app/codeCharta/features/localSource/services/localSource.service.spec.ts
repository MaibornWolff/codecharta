import { TestBed } from "@angular/core/testing"
import { CodeMapNode, FileSelectionState, NodeType } from "../../../model/codeCharta.model"
import { FileStoreReadWindow } from "../../../stores/fileStore/fileStore.facade"
import { LocalDirectoryHandle } from "./fileSystemAccess"
import { fakeDirectory } from "./fileSystemAccess.mocks"
import { LocalSourceService } from "./localSource.service"
import { LocalSourceFolder, LocalSourceFoldersRepository } from "./localSourceFolders.repository"

describe("LocalSourceService", () => {
    const projectMap = {
        name: "root",
        type: NodeType.FOLDER,
        attributes: {},
        children: [
            { name: "src", type: NodeType.FOLDER, attributes: {}, children: [{ name: "Foo.kt", type: NodeType.FILE, attributes: {} }] }
        ]
    } as CodeMapNode
    const otherMap = {
        name: "root",
        type: NodeType.FOLDER,
        attributes: {},
        children: [{ name: "main.py", type: NodeType.FILE, attributes: {} }]
    } as CodeMapNode
    const projectFolder = () => fakeDirectory("myproject", { src: { "Foo.kt": "class Foo", "Bar.kt": "class Bar" } })
    const otherFolder = () => fakeDirectory("other", { "main.py": "print()" })
    const unrelatedFolder = () => fakeDirectory("holiday", { "beach.jpg": "…" })

    const visibleMap = (fileName: string, map: CodeMapNode, selectedAs = FileSelectionState.Partial) => ({
        file: { map, fileMeta: { fileName } },
        selectedAs
    })

    let visibleFileStates: ReturnType<typeof visibleMap>[]
    let loadedFileStates: ReturnType<typeof visibleMap>[]
    let savedFolders: Map<string, LocalSourceFolder>
    let picker: jest.Mock
    let service: LocalSourceService

    beforeEach(() => {
        visibleFileStates = [visibleMap("myproject.cc.json", projectMap)]
        loadedFileStates = [visibleMap("myproject.cc.json", projectMap), visibleMap("other.cc.json", otherMap, FileSelectionState.None)]
        savedFolders = new Map()
        picker = jest.fn()
        ;(window as unknown as { showDirectoryPicker: jest.Mock }).showDirectoryPicker = picker
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: FileStoreReadWindow,
                    useValue: { getVisibleFileStates: () => visibleFileStates, getFiles: () => loadedFileStates }
                },
                {
                    provide: LocalSourceFoldersRepository,
                    useValue: {
                        find: async (mapKey: string) => savedFolders.get(mapKey) ?? null,
                        save: async (folder: LocalSourceFolder) => {
                            savedFolders.set(folder.mapKey, folder)
                        },
                        delete: async (mapKey: string) => {
                            savedFolders.delete(mapKey)
                        }
                    }
                }
            ]
        })
        service = TestBed.inject(LocalSourceService)
    })

    afterEach(() => {
        delete (window as unknown as { showDirectoryPicker?: unknown }).showDirectoryPicker
    })

    function givenSavedFolder(mapKey: string, directory: LocalDirectoryHandle, editorRootPath: string | null = null) {
        savedFolders.set(mapKey, { mapKey, directory, editorRootPath })
    }

    function givenTwoVisibleMaps() {
        visibleFileStates = [visibleMap("myproject.cc.json", projectMap), visibleMap("other.cc.json", otherMap)]
    }

    describe("findSource", () => {
        it("should read the file from the saved folder without asking for a folder", async () => {
            // Arrange
            givenSavedFolder("myproject.cc.json", projectFolder())

            // Act
            const lookup = await service.findSource("/root/src/Bar.kt")

            // Assert
            expect(lookup).toEqual(expect.objectContaining({ status: "found", relativePath: "src/Bar.kt" }))
            expect(lookup.status === "found" && (await lookup.file.text())).toBe("class Bar")
            expect(picker).not.toHaveBeenCalled()
        })

        it("should ask for the folder when none is saved for the map and remember it", async () => {
            // Arrange
            const directory = projectFolder()
            picker.mockResolvedValue(directory)

            // Act
            const lookup = await service.findSource("/root/src/Foo.kt")

            // Assert
            expect(lookup.status).toBe("found")
            expect(savedFolders.get("myproject.cc.json")?.directory).toBe(directory)
        })

        it("should ask for the folder again when the saved one lacks the file and drop the old folder's path", async () => {
            // Arrange
            givenSavedFolder("myproject.cc.json", fakeDirectory("old", { src: { "Foo.kt": "class Foo" } }), "C:/old")
            picker.mockResolvedValue(projectFolder())

            // Act
            const lookup = await service.findSource("/root/src/Bar.kt")

            // Assert
            expect(lookup.status).toBe("found")
            expect(savedFolders.get("myproject.cc.json")?.editorRootPath).toBeNull()
        })

        it("should ask for the folder when reading the saved one is denied", async () => {
            // Arrange
            givenSavedFolder("myproject.cc.json", fakeDirectory("myproject", { src: { "Foo.kt": "class Foo" } }, "denied"))
            picker.mockResolvedValue(projectFolder())

            // Act
            await service.findSource("/root/src/Foo.kt")

            // Assert
            expect(picker).toHaveBeenCalled()
        })

        it("should report a file missing from the newly chosen folder", async () => {
            // Arrange
            picker.mockResolvedValue(projectFolder())

            // Act
            const lookup = await service.findSource("/root/src/Gone.kt")

            // Assert
            expect(lookup).toEqual({ status: "notFound", relativePath: "src/Gone.kt" })
        })

        it("should report a cancelled picker", async () => {
            // Arrange
            picker.mockRejectedValue(new DOMException("cancelled", "AbortError"))

            // Act
            const lookup = await service.findSource("/root/src/Foo.kt")

            // Assert
            expect(lookup).toEqual({ status: "cancelled" })
        })

        it("should read each visible map's files from that map's own folder", async () => {
            // Arrange
            givenTwoVisibleMaps()
            givenSavedFolder("myproject.cc.json", projectFolder())
            givenSavedFolder("other.cc.json", otherFolder())

            // Act
            const lookup = await service.findSource("/root/other.cc.json/main.py")

            // Assert
            expect(lookup.status === "found" && (await lookup.file.text())).toBe("print()")
        })

        it("should not look for a node outside the visible maps", async () => {
            // Arrange
            givenTwoVisibleMaps()

            // Act
            const lookup = await service.findSource("/root/gone.cc.json/main.py")

            // Assert
            expect(lookup).toEqual({ status: "notFound", relativePath: "/root/gone.cc.json/main.py" })
            expect(picker).not.toHaveBeenCalled()
        })
    })

    describe("isMapRoot", () => {
        it("should take the root as the map's root while one map is visible", () => {
            // Act & Assert
            expect(service.isMapRoot("/root")).toBe(true)
            expect(service.isMapRoot("/root/src")).toBe(false)
        })

        it("should take each map's folder as its root while several maps are visible", () => {
            // Arrange
            givenTwoVisibleMaps()

            // Act & Assert
            expect(service.isMapRoot("/root/other.cc.json")).toBe(true)
            expect(service.isMapRoot("/root")).toBe(false)
        })

        it("should take the first map's root in the delta view", () => {
            // Arrange
            visibleFileStates = [
                visibleMap("old.cc.json", projectMap, FileSelectionState.Reference),
                visibleMap("new.cc.json", projectMap, FileSelectionState.Comparison)
            ]

            // Act & Assert
            expect(service.isMapRoot("/root")).toBe(true)
        })
    })

    describe("chooseFolder", () => {
        it("should save the folder for the map the node belongs to", async () => {
            // Arrange
            givenTwoVisibleMaps()
            picker.mockResolvedValue(otherFolder())

            // Act
            const choice = await service.chooseFolder("/root/other.cc.json")

            // Assert
            expect(choice.status).toBe("chosen")
            expect(savedFolders.has("other.cc.json")).toBe(true)
        })

        it("should refuse a folder that contains none of the map's files", async () => {
            // Arrange
            picker.mockResolvedValue(unrelatedFolder())

            // Act
            const choice = await service.chooseFolder("/root")

            // Assert
            expect(choice).toEqual({ status: "doesNotFitMap" })
            expect(savedFolders.size).toBe(0)
        })

        it("should not ask for a folder for a node outside the visible maps", async () => {
            // Arrange
            givenTwoVisibleMaps()

            // Act
            const choice = await service.chooseFolder("/root/gone.cc.json")

            // Assert
            expect(choice).toEqual({ status: "cancelled" })
            expect(picker).not.toHaveBeenCalled()
        })
    })

    describe("chooseFolderForMap", () => {
        it("should save the folder for a loaded map even when it is not visible", async () => {
            // Arrange
            picker.mockResolvedValue(otherFolder())

            // Act
            const choice = await service.chooseFolderForMap("other.cc.json")

            // Assert
            expect(choice.status).toBe("chosen")
            expect(savedFolders.has("other.cc.json")).toBe(true)
        })

        it("should keep the entered path when the same folder is chosen again", async () => {
            // Arrange
            const directory = projectFolder()
            givenSavedFolder("myproject.cc.json", directory, "C:/dev/myproject")
            picker.mockResolvedValue(directory)

            // Act
            await service.chooseFolderForMap("myproject.cc.json")

            // Assert
            expect(savedFolders.get("myproject.cc.json")?.editorRootPath).toBe("C:/dev/myproject")
        })

        it("should not ask for a folder for a map that is not loaded", async () => {
            // Act
            const choice = await service.chooseFolderForMap("gone.cc.json")

            // Assert
            expect(choice).toEqual({ status: "cancelled" })
            expect(picker).not.toHaveBeenCalled()
        })
    })

    describe("describeFolder", () => {
        it("should describe the folder by its full path once it was entered", async () => {
            // Arrange
            givenSavedFolder("myproject.cc.json", projectFolder(), "C:/dev/myproject")

            // Act
            const description = await service.describeFolder("myproject.cc.json")

            // Assert
            expect(description).toBe("C:/dev/myproject")
        })

        it("should describe the folder by its name while its full path is unknown", async () => {
            // Arrange
            givenSavedFolder("myproject.cc.json", projectFolder())

            // Act
            const description = await service.describeFolder("myproject.cc.json")

            // Assert
            expect(description).toBe("myproject")
        })

        it("should describe nothing for a map without a folder", async () => {
            // Act
            const description = await service.describeFolder("myproject.cc.json")

            // Assert
            expect(description).toBeNull()
        })
    })

    describe("forgetFolder", () => {
        it("should forget the map's folder and announce the change", async () => {
            // Arrange
            givenSavedFolder("myproject.cc.json", projectFolder())
            const changesBefore = service.folderChanges()

            // Act
            await service.forgetFolder("myproject.cc.json")

            // Assert
            expect(savedFolders.has("myproject.cc.json")).toBe(false)
            expect(service.folderChanges()).toBe(changesBefore + 1)
        })
    })

    describe("saveEditorRootPath", () => {
        it("should keep the editor path next to the folder", async () => {
            // Arrange
            const folder = { mapKey: "myproject.cc.json", directory: projectFolder(), editorRootPath: null }

            // Act
            const updatedFolder = await service.saveEditorRootPath(folder, "C:/dev/myproject")

            // Assert
            expect(updatedFolder.editorRootPath).toBe("C:/dev/myproject")
            expect(savedFolders.get("myproject.cc.json")?.editorRootPath).toBe("C:/dev/myproject")
        })
    })
})
