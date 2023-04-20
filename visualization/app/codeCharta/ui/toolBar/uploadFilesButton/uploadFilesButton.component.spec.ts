import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import { UploadFilesButtonComponent } from "./uploadFilesButton.component"
import { UploadFilesButtonModule } from "./uploadFilesButton.module"
import { UploadFilesService } from "./uploadFiles.service"

describe("uploadFilesButtonComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [UploadFilesButtonModule],
			providers: [{ provide: UploadFilesService, useValue: {} }]
		})
	})

	it("should render", async () => {
		await render(UploadFilesButtonComponent, { excludeComponentDeclaration: true })
		expect(screen.getByRole("button")).toBeTruthy()
	})
})
