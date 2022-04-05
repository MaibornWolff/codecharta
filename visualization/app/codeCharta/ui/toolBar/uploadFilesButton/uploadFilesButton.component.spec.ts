import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import { CodeChartaServiceToken } from "../../../services/ajs-upgraded-providers"
import { UploadFilesButtonComponent } from "./uploadFilesButton.component"

describe("uploadFilesButtonComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [{ provide: CodeChartaServiceToken, useValue: {} }]
		})
	})

	it("should render", async () => {
		await render(UploadFilesButtonComponent)
		expect(screen.getByRole("button")).toBeTruthy()
	})
})
