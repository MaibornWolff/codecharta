import { signal } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { of } from "rxjs"
import { ActiveViewStore } from "../../../../routing/activeView.store"
import { GlobalSettingsFacade } from "../../../globalSettings/facade"
import { WordCloudScreenshotService } from "../../../screenshot/facade"
import { DomainToolboxComponent } from "./domainToolbox.component"

describe("DomainToolboxComponent", () => {
    let wordCloudScreenshotService: { makeScreenshotToFile: jest.Mock; makeScreenshotToClipboard: jest.Mock }

    beforeEach(() => {
        wordCloudScreenshotService = {
            makeScreenshotToFile: jest.fn().mockResolvedValue(undefined),
            makeScreenshotToClipboard: jest.fn().mockResolvedValue(undefined)
        }

        TestBed.configureTestingModule({
            imports: [DomainToolboxComponent],
            providers: [
                { provide: GlobalSettingsFacade, useValue: { screenshotToClipboardEnabled$: () => of(false) } },
                { provide: ActiveViewStore, useValue: { currentView: () => "domain" } },
                {
                    provide: WordCloudScreenshotService,
                    useValue: {
                        ...wordCloudScreenshotService,
                        isWriteToClipboardAllowed: true,
                        subject: "word cloud",
                        isCaptureAvailable: signal(true).asReadonly()
                    }
                }
            ]
        })
    })

    it("should render the screenshot button", async () => {
        // Arrange & Act
        const { container } = await render(DomainToolboxComponent)

        // Assert
        expect(container.querySelectorAll("cc-toolbox-screenshot-button").length).toBe(1)
    })

    it("should capture the word cloud when the button is clicked", async () => {
        // Arrange
        await render(DomainToolboxComponent)

        // Act
        await userEvent.click(screen.getByRole("button", { name: "Screenshot" }))

        // Assert
        expect(wordCloudScreenshotService.makeScreenshotToFile).toHaveBeenCalledTimes(1)
    })
})
