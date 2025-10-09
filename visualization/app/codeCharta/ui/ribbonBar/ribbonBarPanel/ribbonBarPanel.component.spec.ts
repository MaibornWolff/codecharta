import { provideMockStore } from "@ngrx/store/testing"
import { render, waitFor } from "@testing-library/angular"
import { TestBed } from "@angular/core/testing"
import { RibbonBarPanelSettingsComponent } from "./ribbonBarPanelSettings.component"
import { RibbonBarPanelComponent } from "./ribbonBarPanel.component"
import userEvent from "@testing-library/user-event"
import { Component } from "@angular/core"

@Component({
    selector: "cc-test-wrapper",
    template: `
        <cc-ribbon-bar-panel [isHeaderExpandable]="isHeaderExpandable" [title]="title">
            <cc-ribbon-bar-panel-settings></cc-ribbon-bar-panel-settings>
        </cc-ribbon-bar-panel>
    `,
    imports: [RibbonBarPanelComponent, RibbonBarPanelSettingsComponent]
})
class TestWrapperComponent {
    isHeaderExpandable = false
    title = "Test Panel"
}

describe(RibbonBarPanelComponent.name, () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RibbonBarPanelComponent, RibbonBarPanelSettingsComponent, TestWrapperComponent],
            providers: [provideMockStore()]
        }).compileComponents()
    })

    describe("with expandable settings", () => {
        it("should be expandable", async () => {
            const { container } = await render(TestWrapperComponent)
            const panel = container.querySelector("cc-ribbon-bar-panel")
            expect(panel.classList).toContain("expandable")
        })

        describe("opening and closing of search panel", () => {
            it("should be minimized initially", async () => {
                const { container } = await render(TestWrapperComponent)
                const panel = container.querySelector("cc-ribbon-bar-panel")
                expect(panel.classList).not.toContain("expanded")
            })

            it("should open when clicked on section title", async () => {
                const { container } = await render(TestWrapperComponent)
                const panel = container.querySelector("cc-ribbon-bar-panel")
                await userEvent.click(panel.querySelector(".section-title"))
                await waitFor(() => expect(panel.classList).toContain("expanded"))
            })

            it("should close, when clicking on opened mode", async () => {
                const { container } = await render(TestWrapperComponent)
                const panel = container.querySelector("cc-ribbon-bar-panel")
                const title = panel.querySelector(".section-title")
                await userEvent.click(title)
                await userEvent.click(title)
                await waitFor(() => expect(panel.classList).not.toContain("expanded"))
            })
        })
    })

    it("renders expandable header when isHeaderExpandable is true", async () => {
        const { container } = await render(TestWrapperComponent, {
            componentProperties: {
                isHeaderExpandable: true
            }
        })

        const sectionHeader = container.querySelector(".section-header")
        expect(sectionHeader).toBeTruthy()
    })

    it("renders non-expandable header when isHeaderExpandable is false", async () => {
        const { container } = await render(TestWrapperComponent, {
            componentProperties: {
                isHeaderExpandable: false
            }
        })
        const sectionHeader = container.querySelector(".section-header")
        expect(sectionHeader).toBeTruthy()
    })

    it("should be open when clicked on section header", async () => {
        const { container } = await render(TestWrapperComponent, {
            componentProperties: {
                isHeaderExpandable: true
            }
        })
        await userEvent.click(container.querySelector(".section-header"))
        const panel = container.querySelector("cc-ribbon-bar-panel")
        await waitFor(() => expect(panel.classList).toContain("expanded"))
    })

    it("should not open when clicked on non-expandable header", async () => {
        const { container } = await render(TestWrapperComponent, {
            componentProperties: {
                isHeaderExpandable: false
            }
        })
        await userEvent.click(container.querySelector(".section-header"))
        const panel = container.querySelector("cc-ribbon-bar-panel")
        await waitFor(() => expect(panel.classList).not.toContain("expanded"))
    })

    describe("closing on outside clicks", () => {
        it("should subscribe to mousedown events when opening", async () => {
            const addEventListenerSpy = jest.spyOn(document, "addEventListener")
            await render(TestWrapperComponent)
            expect(addEventListenerSpy).toHaveBeenCalledWith("mousedown", expect.any(Function))
        })

        it("should unsubscribe mousedown events when destroyed", async () => {
            const removeEventListenerSpy = jest.spyOn(document, "removeEventListener")
            const { fixture } = await render(TestWrapperComponent)
            fixture.destroy()
            expect(removeEventListenerSpy).toHaveBeenCalledWith("mousedown", expect.any(Function))
        })

        it("should close on outside clicks", async () => {
            const { container } = await render(TestWrapperComponent)
            const panel = container.querySelector("cc-ribbon-bar-panel")
            await userEvent.click(panel.querySelector(".section-title"))
            await waitFor(() => expect(panel.classList).toContain("expanded"))

            await userEvent.click(document.body)
            await waitFor(() => expect(panel.classList).not.toContain("expanded"))
        })

        it("should not close when clicking inside", async () => {
            const { container } = await render(TestWrapperComponent)
            const panel = container.querySelector("cc-ribbon-bar-panel")
            await userEvent.click(panel.querySelector(".section-title"))
            await waitFor(() => expect(panel.classList).toContain("expanded"))

            await userEvent.click(panel.querySelector("cc-ribbon-bar-panel-settings"))
            await waitFor(() => expect(panel.classList).toContain("expanded"))
        })
    })
})
