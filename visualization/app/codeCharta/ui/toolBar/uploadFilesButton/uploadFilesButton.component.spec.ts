import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import { UploadFilesButtonComponent } from "./uploadFilesButton.component"
import { UploadFilesService } from "./uploadFiles.service"

describe("UploadFilesButtonComponent", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [UploadFilesButtonComponent],
            providers: [{ provide: UploadFilesService, useValue: {} }]
        })
    })

    it("should render", async () => {
        await render(UploadFilesButtonComponent)
        expect(screen.getByRole("button")).toBeTruthy()
    })
})
