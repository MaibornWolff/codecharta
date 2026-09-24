import { TestBed } from "@angular/core/testing"
import { ExplorerOpenFoldersService } from "./explorerOpenFolders.service"

describe("ExplorerOpenFoldersService", () => {
    let openFolders: ExplorerOpenFoldersService

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [ExplorerOpenFoldersService] })
        openFolders = TestBed.inject(ExplorerOpenFoldersService)
    })

    it("should report a folder nobody opened or closed with its default", () => {
        // Arrange & Act
        const openByDefault = openFolders.isOpen("/root", true)
        const closedByDefault = openFolders.isOpen("/root/src", false)

        // Assert
        expect(openByDefault).toBe(true)
        expect(closedByDefault).toBe(false)
    })

    it("should remember a folder that was opened or closed over its default", () => {
        // Arrange & Act
        openFolders.setOpen("/root", false)
        openFolders.setOpen("/root/src", true)

        // Assert
        expect(openFolders.isOpen("/root", true)).toBe(false)
        expect(openFolders.isOpen("/root/src", false)).toBe(true)
    })
})
