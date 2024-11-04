import { TestBed } from "@angular/core/testing"
import { CopyToClipboardService } from "./copyToClipboard.service"
import { CopyToClipboardButtonComponent } from "./copyToClipboardButton.component"

let component: CopyToClipboardButtonComponent
describe("CopyToClipboardButtonComponent", () => {
    const writeToClipboardMock = jest.fn()
    const getClipboardTextMock = jest.fn().mockReturnValue("Magic Monday")

    beforeAll(() => {
        TestBed.configureTestingModule({
            imports: [CopyToClipboardButtonComponent],
            providers: [{ provide: CopyToClipboardService, useValue: { getClipboardText: getClipboardTextMock } }]
        }).compileComponents()

        component = TestBed.createComponent(CopyToClipboardButtonComponent).componentInstance

        //clipboard does not exist in jest's JSdom, see https://stackoverflow.com/questions/62351935/how-to-mock-navigator-clipboard-writetext-in-jest
        Object.assign(navigator, { clipboard: { writeText: writeToClipboardMock } })
    })

    it("should use a get-text-method of service and write resulting text to clipboard", async () => {
        await component.copyNamesToClipBoard()

        expect(getClipboardTextMock).toHaveBeenCalled()
        expect(writeToClipboardMock).toHaveBeenCalledWith("Magic Monday")
    })
})
