import { TestBed } from "@angular/core/testing"
import { CopyToClipboardService } from "./copyToClipboard.service"
import { CopyToClipboardButtonComponent } from "./copyToClipboardButton.component"
import { CopyToClipboardButtonModule } from "./copyToClipboardButton.module"
let component: CopyToClipboardButtonComponent
describe("CopyToClipboardButtonComponent", () => {
	const writeToClipboardMock = jest.fn()
	const getClipboardTextMock = jest.fn().mockReturnValue("Magic Monday")

	beforeAll(() => {
		TestBed.configureTestingModule({
			imports: [CopyToClipboardButtonModule],
			providers: [
				{ provide: CopyToClipboardService, useValue: { getClipboardText: getClipboardTextMock } },
				CopyToClipboardButtonComponent
			]
		})

		component = TestBed.inject(CopyToClipboardButtonComponent)
		TestBed.inject(CopyToClipboardService)

		//clipboard does not exist in jest's JSdom, see https://stackoverflow.com/questions/62351935/how-to-mock-navigator-clipboard-writetext-in-jest
		Object.assign(navigator, { clipboard: { writeText: writeToClipboardMock } })
	})

	it("should use a get-text-method of service and write resulting text to clipboard", async () => {
		await component.copyNamesToClipBoard()

		expect(getClipboardTextMock).toBeCalled()
		expect(writeToClipboardMock).toBeCalledWith("Magic Monday")
	})
})
