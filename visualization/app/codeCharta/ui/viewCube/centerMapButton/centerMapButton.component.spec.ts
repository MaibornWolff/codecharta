import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { ThreeMapControlsService } from "../../codeMap/threeViewer/threeMapControls.service"
import { CenterMapButtonComponent } from "./centerMapButton.component"

describe("CenterMapButtonComponent", () => {
    const threeMapControlsService = { autoFitTo: jest.fn() }

    beforeEach(() => {
        threeMapControlsService.autoFitTo = jest.fn()
        TestBed.configureTestingModule({
            providers: [{ provide: ThreeMapControlsService, useValue: threeMapControlsService }]
        })
    })

    it("should call autoFitTo of threeMapControlsService on click", async () => {
        await render(CenterMapButtonComponent)

        await userEvent.click(screen.getByTitle("Center map"))

        expect(threeMapControlsService.autoFitTo).toHaveBeenCalled()
    })
})
