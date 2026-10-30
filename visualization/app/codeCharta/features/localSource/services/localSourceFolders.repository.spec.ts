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
        await repository.save({ mapKey: "myproject.cc.json", directory, editorRootPath: "C:/dev/myproject" })

        // Act
        const folder = await repository.find("myproject.cc.json")

        // Assert
        expect(folder).toEqual({ mapKey: "myproject.cc.json", directory, editorRootPath: "C:/dev/myproject" })
    })

    it("should read a saved folder back from the database only once per session", async () => {
        // Arrange
        await repository.save({ mapKey: "cached.cc.json", directory, editorRootPath: null })
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

    it("should forget every folder at once", async () => {
        // Arrange
        await repository.save({ mapKey: "first.cc.json", directory, editorRootPath: null })
        await repository.save({ mapKey: "second.cc.json", directory, editorRootPath: "C:/dev/second" })

        // Act
        await repository.deleteAll()

        // Assert
        expect(await repository.find("first.cc.json")).toBeNull()
        expect(await new LocalSourceFoldersRepository().find("second.cc.json")).toBeNull()
    })

    it("should forget a deleted folder", async () => {
        // Arrange
        await repository.save({ mapKey: "forgotten.cc.json", directory, editorRootPath: null })

        // Act
        await repository.delete("forgotten.cc.json")

        // Assert
        expect(await repository.find("forgotten.cc.json")).toBeNull()
    })
})
