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

    it("should forget a deleted folder", async () => {
        // Arrange
        await repository.save({ mapKey: "forgotten.cc.json", directory, editorRootPath: null })

        // Act
        await repository.delete("forgotten.cc.json")

        // Assert
        expect(await repository.find("forgotten.cc.json")).toBeNull()
    })
})
