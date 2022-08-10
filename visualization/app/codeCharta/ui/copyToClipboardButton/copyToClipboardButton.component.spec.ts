import { TestBed } from "@angular/core/testing"
import { CopyToClipboardButtonComponent } from "./copyToClipboardButton.component"
import { CopyToClipboardButtonModule } from "./copyToClipboardButton.module"

describe("CopyToClipboardButtonComponent", () => {
	let component: CopyToClipboardButtonComponent

	beforeEach(() => {
		const test = TestBed.configureTestingModule({
			imports: [CopyToClipboardButtonModule]
		})
		component = test.createComponent<CopyToClipboardButtonComponent>(CopyToClipboardButtonComponent).componentInstance
		component["service"].getClipboardText = () => "Magic Monday"

		//clipboard does not exist in jest's JSdom, see https://stackoverflow.com/questions/62351935/how-to-mock-navigator-clipboard-writetext-in-jest
		Object.assign(navigator, { clipboard: { writeText: jest.fn() } })
	})

	describe("downloadFile", () => {
		it("temp", async () => {
			const clipboard = navigator.clipboard
			const writeToClipboardSpy = jest.spyOn(clipboard, "writeText")

			await component.copyNamesToClipBoard()

			expect(writeToClipboardSpy).toBeCalled()
		})
	})
})
