import { ToastService } from "../../shared/facade"
import { fakeDirectory } from "./fileSystemAccess.mocks"
import { FOLDER_DOES_NOT_FIT_MAP_MESSAGE, reportFolderChoice } from "./folderChoiceToast"

describe("reportFolderChoice", () => {
    const toast = { show: jest.fn() } as unknown as ToastService

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should confirm a chosen folder by its name", () => {
        // Arrange
        const folder = { mapKey: "map", directory: fakeDirectory("myproject", {}), editorRootPath: null }

        // Act
        reportFolderChoice(toast, { status: "chosen", folder })

        // Assert
        expect(toast.show).toHaveBeenCalledWith('Local folder "myproject" set for this map', "success")
    })

    it("should warn about a folder that does not fit the map", () => {
        // Act
        reportFolderChoice(toast, { status: "doesNotFitMap" })

        // Assert
        expect(toast.show).toHaveBeenCalledWith(FOLDER_DOES_NOT_FIT_MAP_MESSAGE, "warning")
    })

    it("should stay silent when the picker was cancelled", () => {
        // Act
        reportFolderChoice(toast, { status: "cancelled" })

        // Assert
        expect(toast.show).not.toHaveBeenCalled()
    })
})
