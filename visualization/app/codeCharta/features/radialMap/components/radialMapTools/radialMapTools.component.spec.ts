import { signal } from "@angular/core"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { of } from "rxjs"
import { GlobalSettingsFacade } from "../../../globalSettings/facade"
import { RadialMapScreenshotService } from "../../../screenshot/facade"
import { RadialMapToolsComponent } from "./radialMapTools.component"

describe("RadialMapToolsComponent", () => {
    it("should take the screenshot of the radial map", async () => {
        // Arrange
        const radialMapScreenshotService = {
            makeScreenshotToFile: jest.fn().mockResolvedValue(undefined),
            makeScreenshotToClipboard: jest.fn().mockResolvedValue(undefined),
            isWriteToClipboardAllowed: true,
            subject: "map",
            isCaptureAvailable: signal(true).asReadonly()
        }
        await render(RadialMapToolsComponent, {
            providers: [
                { provide: RadialMapScreenshotService, useValue: radialMapScreenshotService },
                { provide: GlobalSettingsFacade, useValue: { screenshotToClipboardEnabled$: () => of(false) } }
            ]
        })

        // Act
        await userEvent.click(screen.getByRole("button", { name: "Screenshot" }))

        // Assert
        expect(radialMapScreenshotService.makeScreenshotToFile).toHaveBeenCalledTimes(1)
    })
})
