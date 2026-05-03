import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { ThreeMapControlsService } from "../../../../ui/codeMap/threeViewer/threeMapControls.service"
import { CenterMapButtonComponent } from "./centerMapButton.component"

describe("CenterMapButtonComponent (toolbox)", () => {
    const threeMapControlsService = { autoFitTo: jest.fn() }

    beforeEach(() => {
        threeMapControlsService.autoFitTo = jest.fn()
        TestBed.configureTestingModule({
            providers: [{ provide: ThreeMapControlsService, useValue: threeMapControlsService }]
        })
    })

    it("should call autoFitTo of ThreeMapControlsService on click", async () => {
        // Arrange
        await render(CenterMapButtonComponent)

        // Act
        await userEvent.click(screen.getByTitle("Center map"))

        // Assert
        expect(threeMapControlsService.autoFitTo).toHaveBeenCalledTimes(1)
    })
})
