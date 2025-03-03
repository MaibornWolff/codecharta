import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import { PresentationModeButtonComponent } from "./presentationModeButton.component"
import { provideMockStore } from "@ngrx/store/testing"
import { isPresentationModeSelector } from "../../../state/store/appSettings/isPresentationMode/isPresentationMode.selector"

describe("presentationModeButtonComponent", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [PresentationModeButtonComponent],
            providers: [provideMockStore({ selectors: [{ selector: isPresentationModeSelector, value: false }] })]
        })
    })

    it("should toggle presentation mode", async () => {
        await render(PresentationModeButtonComponent)
        expect(screen.getByTitle("Enable flashlight hover effect")).toBeTruthy()
    })
})
