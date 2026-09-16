import { TestBed } from "@angular/core/testing"
import { fireEvent, render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { ThreeMapControlsService } from "../../../../renderer/threeViewer/threeViewer.facade"
import { FloatingMenuAnchor } from "../../../shared/facade"
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
        await userEvent.click(screen.getByRole("button", { name: "Center map" }))

        // Assert
        expect(threeMapControlsService.autoFitTo).toHaveBeenCalledTimes(1)
    })

    it("should request the zoom menu at the cursor on right click without centering the map", async () => {
        // Arrange
        const { fixture } = await render(CenterMapButtonComponent)
        const requestedAnchors: FloatingMenuAnchor[] = []
        fixture.componentInstance.zoomMenuRequested.subscribe(anchor => requestedAnchors.push(anchor))

        // Act
        fireEvent.contextMenu(screen.getByRole("button", { name: "Center map" }), { clientX: 120, clientY: 30 })

        // Assert
        expect(requestedAnchors).toEqual([{ x: 120, y: 30 }])
        expect(threeMapControlsService.autoFitTo).not.toHaveBeenCalled()
    })
})
