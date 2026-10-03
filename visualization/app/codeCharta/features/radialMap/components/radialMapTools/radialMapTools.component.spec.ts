import { signal } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { of } from "rxjs"
import { defaultState } from "../../../../stores/rootStore/state.manager"
import { currentFocusedNodePathSelector } from "../../../../stores/sharedView/sharedView.read.facade"
import { unfocusNode } from "../../../../stores/sharedView/sharedView.write.facade"
import { GlobalSettingsFacade } from "../../../globalSettings/facade"
import { RadialMapScreenshotService } from "../../../screenshot/facade"
import { RadialMapToolsComponent } from "./radialMapTools.component"

describe("RadialMapToolsComponent", () => {
    let radialMapScreenshotService: {
        makeScreenshotToFile: jest.Mock
        makeScreenshotToClipboard: jest.Mock
        isWriteToClipboardAllowed: boolean
        subject: string
        isCaptureAvailable: () => boolean
    }

    async function renderTools(focusedNodePath?: string) {
        radialMapScreenshotService = {
            makeScreenshotToFile: jest.fn().mockResolvedValue(undefined),
            makeScreenshotToClipboard: jest.fn().mockResolvedValue(undefined),
            isWriteToClipboardAllowed: true,
            subject: "map",
            isCaptureAvailable: signal(true).asReadonly()
        }
        await render(RadialMapToolsComponent, {
            providers: [
                provideMockStore({
                    initialState: defaultState,
                    selectors: [{ selector: currentFocusedNodePathSelector, value: focusedNodePath }]
                }),
                { provide: State, useValue: { getValue: () => defaultState } },
                { provide: RadialMapScreenshotService, useValue: radialMapScreenshotService },
                { provide: GlobalSettingsFacade, useValue: { screenshotToClipboardEnabled$: () => of(false) } }
            ]
        })
        return jest.spyOn(TestBed.inject(MockStore), "dispatch")
    }

    function isUnfocusRevealed(): boolean {
        return !screen.getByTestId("metrics-bar-unfocus").closest("cc-bar-tool").hasAttribute("inert")
    }

    it("should take the screenshot of the radial map", async () => {
        // Arrange
        await renderTools()

        // Act
        await userEvent.click(screen.getByRole("button", { name: "Screenshot" }))

        // Assert
        expect(radialMapScreenshotService.makeScreenshotToFile).toHaveBeenCalledTimes(1)
    })

    it("should keep unfocus hidden while nothing is focused", async () => {
        // Act
        await renderTools()

        // Assert
        expect(isUnfocusRevealed()).toBe(false)
    })

    it("should reveal unfocus while a folder is focused, and show the whole map again", async () => {
        // Arrange
        const dispatch = await renderTools("/root/src")

        // Act
        await userEvent.click(screen.getByTestId("metrics-bar-unfocus"))

        // Assert
        expect(isUnfocusRevealed()).toBe(true)
        expect(dispatch).toHaveBeenCalledWith(unfocusNode())
    })
})
