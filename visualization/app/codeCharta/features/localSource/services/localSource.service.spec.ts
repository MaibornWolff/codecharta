import { signal } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { CodeMapNode, FileSelectionState, NodeType } from "../../../model/codeCharta.model"
import { FileStoreReadWindow } from "../../../stores/fileStore/fileStore.facade"
import { ToastService } from "../../shared/facade"
import { LocalDirectoryHandle } from "./fileSystemAccess"
import { fakeDirectory } from "./fileSystemAccess.mocks"
import { LocalSourceService } from "./localSource.service"
import { LocalSourceAvailability } from "./localSourceAvailability"
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
    const availabilityMock = { isAvailable: signal(true), reportBlocked: jest.fn() }
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
                { provide: LocalSourceAvailability, useValue: availabilityMock },
                {
                    provide: LocalSourceFoldersRepository,
                    useValue: {
                        find: async (mapKey: string) => savedFolders.get(mapKey) ?? null,
                        save: async (folder: LocalSourceFolder) => {
                            savedFolders.set(folder.mapKey, folder)
                        },
                        delete: async (mapKey: string) => {
                            savedFolders.delete(mapKey)
                        },
                        deleteAll: async () => {
                            savedFolders.clear()
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

        it("should ask for a folder, without opening the picker, when none is saved for the map", async () => {
            // Act
            const lookup = await service.findSource("/root/src/Foo.kt")

            // Assert
            expect(lookup).toEqual({
                status: "folderNeeded",
                mapFileName: "myproject.cc.json",
                relativePath: "src/Foo.kt",
                missingFrom: null
            })
            expect(picker).not.toHaveBeenCalled()
        })

        it("should name the saved folder when it lacks the file", async () => {
            // Arrange
            givenSavedFolder("myproject.cc.json", fakeDirectory("old", { src: { "Foo.kt": "class Foo" } }))

            // Act
            const lookup = await service.findSource("/root/src/Bar.kt")

            // Assert
            expect(lookup).toEqual(expect.objectContaining({ status: "folderNeeded", missingFrom: "old" }))
            expect(picker).not.toHaveBeenCalled()
        })

        it("should ask for a folder when reading the saved one is denied", async () => {
            // Arrange
            givenSavedFolder("myproject.cc.json", fakeDirectory("myproject", { src: { "Foo.kt": "class Foo" } }, "denied"))

            // Act
            const lookup = await service.findSource("/root/src/Foo.kt")

            // Assert
            expect(lookup).toEqual(expect.objectContaining({ status: "folderNeeded", missingFrom: null }))
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

    describe("chooseFolderAndFindSource", () => {
        it("should remember the chosen folder and find the file in it", async () => {
            // Arrange
            const directory = projectFolder()
            picker.mockResolvedValue(directory)

            // Act
            const lookup = await service.chooseFolderAndFindSource("/root/src/Foo.kt")

            // Assert
            expect(lookup.status).toBe("found")
            expect(savedFolders.get("myproject.cc.json")?.directory).toBe(directory)
        })

        it("should keep the VS Code path when choosing another folder", async () => {
            // Arrange
            givenSavedFolder("myproject.cc.json", fakeDirectory("old", {}), "C:/old")
            picker.mockResolvedValue(projectFolder())

            // Act
            await service.chooseFolderAndFindSource("/root/src/Bar.kt")

            // Assert
            expect(savedFolders.get("myproject.cc.json")?.editorRootPath).toBe("C:/old")
        })

        it("should report a file missing from the newly chosen folder", async () => {
            // Arrange
            picker.mockResolvedValue(projectFolder())

            // Act
            const lookup = await service.chooseFolderAndFindSource("/root/src/Gone.kt")

            // Assert
            expect(lookup).toEqual({ status: "notFound", relativePath: "src/Gone.kt" })
        })

        it("should report a picker the browser blocks, so that the local source entries go away", async () => {
            // Arrange
            picker.mockRejectedValue(new DOMException("forbidden by policy", "SecurityError"))
            availabilityMock.reportBlocked.mockClear()

            // Act
            const lookup = await service.chooseFolderAndFindSource("/root/src/Foo.kt")

            // Assert
            expect(lookup).toEqual({ status: "blocked" })
            expect(availabilityMock.reportBlocked).toHaveBeenCalled()
        })

        it("should pass on a picker failure that is no block", async () => {
            // Arrange
            picker.mockRejectedValue(new TypeError("picker broken"))

            // Act
            const lookup = service.chooseFolderAndFindSource("/root/src/Foo.kt")

            // Assert
            await expect(lookup).rejects.toThrow("picker broken")
        })

        it("should report a cancelled picker", async () => {
            // Arrange
            picker.mockRejectedValue(new DOMException("cancelled", "AbortError"))

            // Act
            const lookup = await service.chooseFolderAndFindSource("/root/src/Foo.kt")

            // Assert
            expect(lookup).toEqual({ status: "cancelled" })
        })

        it("should not ask for a folder for a node outside the visible maps", async () => {
            // Arrange
            givenTwoVisibleMaps()

            // Act
            const lookup = await service.chooseFolderAndFindSource("/root/gone.cc.json/main.py")

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
        it("should describe the folder by its name and the path entered for the editor", async () => {
            // Arrange
            givenSavedFolder("myproject.cc.json", projectFolder(), "C:/dev/myproject")

            // Act
            const description = await service.describeFolder("myproject.cc.json")

            // Assert
            expect(description).toEqual({ folderName: "myproject", editorRootPath: "C:/dev/myproject" })
        })

        it("should describe a VS Code path set without a local folder", async () => {
            // Arrange
            savedFolders.set("myproject.cc.json", { mapKey: "myproject.cc.json", directory: null, editorRootPath: "C:/dev/myproject" })

            // Act
            const description = await service.describeFolder("myproject.cc.json")

            // Assert
            expect(description).toEqual({ folderName: null, editorRootPath: "C:/dev/myproject" })
        })

        it("should describe nothing for a map without a folder", async () => {
            // Act
            const description = await service.describeFolder("myproject.cc.json")

            // Assert
            expect(description).toBeNull()
        })
    })

    describe("forgetFoldersOf", () => {
        it("should forget the removed maps' folders, keep the others and announce the change", async () => {
            // Arrange
            givenSavedFolder("myproject.cc.json", projectFolder(), "C:/dev/myproject")
            givenSavedFolder("other.cc.json", otherFolder())
            const changesBefore = service.folderChanges()

            // Act
            await service.forgetFoldersOf(["myproject.cc.json"])

            // Assert
            expect([...savedFolders.keys()]).toEqual(["other.cc.json"])
            expect(service.folderChanges()).toBe(changesBefore + 1)
        })

        it("should announce nothing when no map is removed", async () => {
            // Arrange
            const changesBefore = service.folderChanges()

            // Act
            await service.forgetFoldersOf([])

            // Assert
            expect(service.folderChanges()).toBe(changesBefore)
        })

        it("should not touch the browser's storage where folders cannot be opened", async () => {
            // Arrange
            givenSavedFolder("myproject.cc.json", projectFolder())
            delete (window as unknown as { showDirectoryPicker?: unknown }).showDirectoryPicker

            // Act
            await service.forgetFoldersOf(["myproject.cc.json"])
            await service.forgetAllFolders()

            // Assert
            expect(savedFolders.size).toBe(1)
        })

        it("should report a folder that could not be forgotten", async () => {
            // Arrange
            const toastSpy = jest.spyOn(TestBed.inject(ToastService), "show")
            jest.spyOn(TestBed.inject(LocalSourceFoldersRepository), "delete").mockRejectedValue(new Error("storage gone"))

            // Act
            await service.forgetFoldersOf(["myproject.cc.json"])

            // Assert
            expect(toastSpy).toHaveBeenCalledWith("The local folder of a removed map could not be forgotten", "warning")
        })
    })

    describe("forgetAllFolders", () => {
        it("should forget every saved folder", async () => {
            // Arrange
            givenSavedFolder("myproject.cc.json", projectFolder())
            givenSavedFolder("other.cc.json", otherFolder())

            // Act
            await service.forgetAllFolders()

            // Assert
            expect(savedFolders.size).toBe(0)
        })
    })

    describe("editorTargetOf", () => {
        it("should name the map, the file below its root and the saved path, without touching the local folder", async () => {
            // Arrange
            savedFolders.set("myproject.cc.json", { mapKey: "myproject.cc.json", directory: null, editorRootPath: "C:/dev/myproject" })

            // Act
            const target = await service.editorTargetOf("/root/src/Foo.kt")

            // Assert
            expect(target).toEqual({ mapFileName: "myproject.cc.json", relativePath: "src/Foo.kt", editorRootPath: "C:/dev/myproject" })
            expect(picker).not.toHaveBeenCalled()
        })

        it("should name no path while none is saved", async () => {
            // Act
            const target = await service.editorTargetOf("/root/src/Foo.kt")

            // Assert
            expect(target.editorRootPath).toBeNull()
        })

        it("should name nothing for a node outside the visible maps", async () => {
            // Arrange
            givenTwoVisibleMaps()

            // Act
            const target = await service.editorTargetOf("/root/gone.cc.json/Foo.kt")

            // Assert
            expect(target).toBeNull()
        })
    })

    describe("saveEditorRootPath", () => {
        it("should save the VS Code path without a local folder", async () => {
            // Arrange
            const changesBefore = service.folderChanges()

            // Act
            await service.saveEditorRootPath("myproject.cc.json", "C:/dev/myproject")

            // Assert
            expect(savedFolders.get("myproject.cc.json")).toEqual({
                mapKey: "myproject.cc.json",
                directory: null,
                editorRootPath: "C:/dev/myproject"
            })
            expect(service.folderChanges()).toBe(changesBefore + 1)
        })

        it("should keep the local folder that is already set", async () => {
            // Arrange
            const directory = projectFolder()
            givenSavedFolder("myproject.cc.json", directory)

            // Act
            await service.saveEditorRootPath("myproject.cc.json", "C:/dev/myproject")

            // Assert
            expect(savedFolders.get("myproject.cc.json")?.directory).toBe(directory)
        })

        it("should still ask for the local folder when only a VS Code path is saved", async () => {
            // Arrange
            savedFolders.set("myproject.cc.json", { mapKey: "myproject.cc.json", directory: null, editorRootPath: "C:/dev/myproject" })

            // Act
            const lookup = await service.findSource("/root/src/Foo.kt")

            // Assert
            expect(lookup).toEqual(expect.objectContaining({ status: "folderNeeded", missingFrom: null }))
        })
    })
})
