import { signal } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { of } from "rxjs"
import { ActiveViewStore } from "../../../../routing/activeView.store"
import { GlobalSettingsFacade } from "../../../globalSettings/facade"
import { WordCloudScreenshotService } from "../../../screenshot/facade"
import { SharedFocusStore } from "../../../shared/facade"
import { WordCloudViewStore } from "../../stores/wordCloudView.store"
import { DomainToolboxComponent } from "./domainToolbox.component"

describe("DomainToolboxComponent", () => {
    let wordCloudScreenshotService: { makeScreenshotToFile: jest.Mock; makeScreenshotToClipboard: jest.Mock }
    const isFocused = signal(false)
    const unfocus = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        isFocused.set(false)
        wordCloudScreenshotService = {
            makeScreenshotToFile: jest.fn().mockResolvedValue(undefined),
            makeScreenshotToClipboard: jest.fn().mockResolvedValue(undefined)
        }

        TestBed.configureTestingModule({
            imports: [DomainToolboxComponent],
            providers: [
                { provide: GlobalSettingsFacade, useValue: { screenshotToClipboardEnabled$: () => of(false) } },
                { provide: ActiveViewStore, useValue: { currentView: () => "domain" } },
                { provide: SharedFocusStore, useValue: { isFocused, unfocus } },
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

    it("should ask for the whole cloud when Show whole cloud is clicked", async () => {
        // Arrange
        await render(DomainToolboxComponent)
        const viewStore = TestBed.inject(WordCloudViewStore)
        const fitRequestBefore = viewStore.fitRequest()

        // Act
        await userEvent.click(screen.getByTestId("domain-reset-view"))

        // Assert
        expect(viewStore.fitRequest()).toBe(fitRequestBefore + 1)
    })

    it("should offer no divider while nothing is focused", async () => {
        // Arrange & Act
        await render(DomainToolboxComponent)

        // Assert
        expect(screen.queryByTestId("domain-tools-divider")).toBeNull()
    })

    it("should let go of the focus when Unfocus is clicked", async () => {
        // Arrange
        isFocused.set(true)
        await render(DomainToolboxComponent)

        // Act
        await userEvent.click(screen.getByTestId("domain-bar-unfocus"))

        // Assert
        expect(unfocus).toHaveBeenCalledTimes(1)
        expect(screen.getByTestId("domain-tools-divider")).toBeTruthy()
    })
})
