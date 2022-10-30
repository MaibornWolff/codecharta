import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import { LoadFileService } from "../../../services/loadFile/loadFile.service"
import { UploadFilesButtonComponent } from "./uploadFilesButton.component"
import { UploadFilesButtonModule } from "./uploadFilesButton.module"

describe("uploadFilesButtonComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [UploadFilesButtonModule],
			providers: [{ provide: LoadFileService, useValue: {} }]
		})
	})

	it("should render", async () => {
		await render(UploadFilesButtonComponent, { excludeComponentDeclaration: true })
		expect(screen.getByRole("button")).toBeTruthy()
	})
})
