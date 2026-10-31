import "fake-indexeddb/auto"

if (typeof globalThis.structuredClone === "undefined") {
    globalThis.structuredClone = <T>(value: T): T => JSON.parse(JSON.stringify(value))
}

import { LocalDirectoryHandle } from "./fileSystemAccess"
import { LocalSourceFoldersRepository } from "./localSourceFolders.repository"

describe("LocalSourceFoldersRepository", () => {
    const directory = { name: "myproject", kind: "directory" } as LocalDirectoryHandle
    const repository = new LocalSourceFoldersRepository()

    it("should find nothing for a map without a saved folder", async () => {
        // Act
        const folder = await repository.find("unknown.cc.json")

        // Assert
        expect(folder).toBeNull()
    })

    it("should find the folder saved for a map", async () => {
        // Arrange
        await repository.update("myproject.cc.json", { directory, editorRootPath: "C:/dev/myproject" })

        // Act
        const folder = await repository.find("myproject.cc.json")

        // Assert
        expect(folder).toEqual({ mapKey: "myproject.cc.json", directory, editorRootPath: "C:/dev/myproject" })
    })

    it("should read a saved folder back from the database only once per session", async () => {
        // Arrange
        await repository.update("cached.cc.json", { directory, editorRootPath: null })
        const reader = new LocalSourceFoldersRepository()
        const firstRead = await reader.find("cached.cc.json")
        const getSpy = jest.spyOn(IDBObjectStore.prototype, "get")

        // Act
        const secondRead = await reader.find("cached.cc.json")

        // Assert
        expect(secondRead).toBe(firstRead)
        expect(getSpy).not.toHaveBeenCalled()
        getSpy.mockRestore()
    })

    it("should keep what another tab saved when this tab updates a map it had read before", async () => {
        // Arrange
        const otherTab = new LocalSourceFoldersRepository()
        const thisTab = new LocalSourceFoldersRepository()
        await thisTab.find("shared.cc.json")
        await otherTab.update("shared.cc.json", { directory })

        // Act
        const folder = await thisTab.update("shared.cc.json", { editorRootPath: "C:/dev/shared" })

        // Assert
        expect(folder).toEqual({ mapKey: "shared.cc.json", directory, editorRootPath: "C:/dev/shared" })
    })

    it("should forget every folder at once", async () => {
        // Arrange
        await repository.update("first.cc.json", { directory, editorRootPath: null })
        await repository.update("second.cc.json", { directory, editorRootPath: "C:/dev/second" })

        // Act
        await repository.deleteAll()

        // Assert
        expect(await repository.find("first.cc.json")).toBeNull()
        expect(await new LocalSourceFoldersRepository().find("second.cc.json")).toBeNull()
    })

    it("should forget a deleted folder", async () => {
        // Arrange
        await repository.update("forgotten.cc.json", { directory, editorRootPath: null })

        // Act
        await repository.delete("forgotten.cc.json")

        // Assert
        expect(await repository.find("forgotten.cc.json")).toBeNull()
    })
})
