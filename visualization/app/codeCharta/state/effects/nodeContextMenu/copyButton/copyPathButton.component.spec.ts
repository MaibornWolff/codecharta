import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing"
import { By } from "@angular/platform-browser"
import { CopyPathButtonComponent } from "./copyPathButton.component"
import { DebugElement } from "@angular/core"

describe("CopyPathButtonComponent", () => {
    const filePath = "/path/to/my/file.ts"
    let fixture: ComponentFixture<CopyPathButtonComponent>
    let component: CopyPathButtonComponent

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [CopyPathButtonComponent]
        }).compileComponents()

        fixture = TestBed.createComponent(CopyPathButtonComponent)

        component = fixture.componentInstance
        component.codeMapNode = { path: filePath }

        fixture.detectChanges()
    }))

    it("should create the component", () => {
        expect(component).toBeTruthy()
    })

    it("should render a button with the correct title", () => {
        const copyButton = getCopyButton()

        expect(copyButton).toBeTruthy()
        expect(copyButton.getAttribute("title")).toBe("Copy to clipboard")
    })

    it("should display the last part of the node path using LastPartOfNodePathPipe", () => {
        const copyButton = getCopyButton()

        expect(copyButton.textContent?.trim()).toEqual(".../file.ts")
    })

    it("should call copyToClipboard with the correct path when the button is clicked", () => {
        jest.spyOn(component, "copyToClipboard")

        clickCopyButton()

        expect(component.copyToClipboard).toHaveBeenCalledWith(filePath)
    })

    it("should write the correct path to the clipboard when copyToClipboard is called", async () => {
        makeClipBoardAvailableForJestAndSpying()
        jest.spyOn(navigator.clipboard, "writeText")

        await component.copyToClipboard(filePath)

        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(filePath)
    })

    function getCopyButton(): HTMLElement {
        const debugCopyButton = fixture.debugElement.query(By.css("button#copy-button"))
        return debugCopyButton.nativeElement
    }

    function clickCopyButton() {
        const debugCopyButton = getDebugCopyButton()
        debugCopyButton.triggerEventHandler("click", null)
    }

    function getDebugCopyButton(): DebugElement {
        return fixture.debugElement.query(By.css("button#copy-button"))
    }

    function makeClipBoardAvailableForJestAndSpying() {
        Object.assign(navigator, {
            clipboard: {
                writeText: jest.fn()
            }
        })
    }
})
