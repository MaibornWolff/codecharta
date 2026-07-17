import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import { UploadFilesService } from "../../services/uploadFiles.service"
import { NavBarFolderButtonComponent } from "./navBarFolderButton.component"

describe("NavBarFolderButtonComponent", () => {
    let uploadFilesService: { uploadFiles: jest.Mock }

    beforeEach(() => {
        uploadFilesService = { uploadFiles: jest.fn() }
        TestBed.configureTestingModule({
            imports: [NavBarFolderButtonComponent],
            providers: [{ provide: UploadFilesService, useValue: uploadFilesService }]
        })
    })

    it("should call UploadFilesService.uploadFiles when the button is clicked", async () => {
        // Arrange
        await render(NavBarFolderButtonComponent)

        // Act
        screen.getByRole("button").click()

        // Assert
        expect(uploadFilesService.uploadFiles).toHaveBeenCalledTimes(1)
    })
})
