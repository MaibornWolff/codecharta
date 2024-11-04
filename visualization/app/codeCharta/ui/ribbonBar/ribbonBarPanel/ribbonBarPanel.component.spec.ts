import { provideMockStore } from "@ngrx/store/testing"
import { RibbonBarPanelModule } from "./ribbonBarPanel.module"
import { render, waitFor } from "@testing-library/angular"
import { TestBed } from "@angular/core/testing"
import { RibbonBarPanelSettingsComponent } from "./ribbonBarPanelSettings.component"
import { RibbonBarPanelComponent } from "./ribbonBarPanel.component"
import userEvent from "@testing-library/user-event"
import { ViewContainerRef } from "@angular/core"

describe(RibbonBarPanelComponent.name, () => {
    describe("with expandable settings", () => {
        let panel: Element

        beforeEach(async () => {
            TestBed.configureTestingModule({
                imports: [RibbonBarPanelModule],
                providers: [RibbonBarPanelComponent, RibbonBarPanelSettingsComponent, provideMockStore()]
            })
            const { container } = await render(
                `<cc-ribbon-bar-panel [isHeaderExpandable]="false">
                            <div></div>
                            <cc-ribbon-bar-panel-settings></cc-ribbon-bar-panel-settings>
                         </cc-ribbon-bar-panel>`,
                {
                    excludeComponentDeclaration: true
                }
            )
            panel = container.querySelector("cc-ribbon-bar-panel")
        })

        it("should be expandable", () => {
            expect(panel.classList).toContain("expandable")
        })

        describe("opening and closing of search panel", () => {
            it("should be minimized initially", async () => {
                expect(panel.classList).not.toContain("expanded")
            })

            it("should open when clicked on section title", async () => {
                await userEvent.click(panel.querySelector(".section-title"))
                await waitFor(() => expect(panel.classList).toContain("expanded"))
            })

            it("should close, when clicking on opened mode", async () => {
                const title = panel.querySelector(".section-title")
                await userEvent.click(title)
                await userEvent.click(title)
                await waitFor(() => expect(panel.classList).not.toContain("expanded"))
            })
        })
    })

    it("renders expandable header when isHeaderExpandable is true", async () => {
        TestBed.configureTestingModule({
            imports: [RibbonBarPanelModule],
            providers: [RibbonBarPanelComponent, RibbonBarPanelSettingsComponent, provideMockStore()]
        })
        const { container } = await render(
            `<cc-ribbon-bar-panel [isHeaderExpandable]="true">
            <div class="toggleHeader"></div>
            <cc-ribbon-bar-panel-settings></cc-ribbon-bar-panel-settings>
         </cc-ribbon-bar-panel>`,
            {
                excludeComponentDeclaration: true
            }
        )

        const toggleHeader = container.querySelector(".toggleHeader")
        expect(toggleHeader).toBeTruthy()
    })

    it("renders non-expandable header when isHeaderExpandable is false", async () => {
        TestBed.configureTestingModule({
            imports: [RibbonBarPanelModule],
            providers: [RibbonBarPanelComponent, RibbonBarPanelSettingsComponent, provideMockStore()]
        })
        const { container } = await render(
            `<cc-ribbon-bar-panel [isHeaderExpandable]="false">
            <div></div>
            <cc-ribbon-bar-panel-settings></cc-ribbon-bar-panel-settings>
         </cc-ribbon-bar-panel>`,
            {
                excludeComponentDeclaration: true
            }
        )
        const sectionHeader = container.querySelector(".section-header")
        expect(sectionHeader).toBeTruthy()
    })

    it("should be open when clicked on section header", async () => {
        TestBed.configureTestingModule({
            imports: [RibbonBarPanelModule],
            providers: [RibbonBarPanelComponent, RibbonBarPanelSettingsComponent, provideMockStore()]
        })
        const { container } = await render(
            `<cc-ribbon-bar-panel [isHeaderExpandable]="true">
            <div class="toggleHeader"></div>
            <cc-ribbon-bar-panel-settings></cc-ribbon-bar-panel-settings>
         </cc-ribbon-bar-panel>`,
            {
                excludeComponentDeclaration: true
            }
        )
        await userEvent.click(container.querySelector(".section-header"))
        const panel = container.querySelector("cc-ribbon-bar-panel")
        await waitFor(() => expect(panel.classList).toContain("expanded"))
    })

    it("should not open when clicked on non-expandable header", async () => {
        TestBed.configureTestingModule({
            imports: [RibbonBarPanelModule],
            providers: [RibbonBarPanelComponent, RibbonBarPanelSettingsComponent, provideMockStore()]
        })
        const { container } = await render(
            `<cc-ribbon-bar-panel>
            <div></div>
            <cc-ribbon-bar-panel-settings></cc-ribbon-bar-panel-settings>
         </cc-ribbon-bar-panel>`,
            {
                excludeComponentDeclaration: true
            }
        )
        await userEvent.click(container.querySelector(".section-header"))
        const panel = container.querySelector("cc-ribbon-bar-panel")
        await waitFor(() => expect(panel.classList).not.toContain("expanded"))
    })

    describe("closing on outside clicks", () => {
        let panel: Element

        beforeEach(async () => {
            TestBed.configureTestingModule({
                imports: [RibbonBarPanelModule],
                providers: [RibbonBarPanelComponent, RibbonBarPanelSettingsComponent, provideMockStore(), ViewContainerRef]
            })
            const { container } = await render(
                `<cc-ribbon-bar-panel [isHeaderExpandable]="false">
                            <div></div>
                            <cc-ribbon-bar-panel-settings></cc-ribbon-bar-panel-settings>
                         </cc-ribbon-bar-panel>`,
                {
                    excludeComponentDeclaration: true
                }
            )
            panel = container.querySelector("cc-ribbon-bar-panel")
        })

        it("should subscribe to mousedown events when opening", () => {
            const addEventListenerSpy = jest.spyOn(document, "addEventListener")
            const panel = TestBed.inject(RibbonBarPanelComponent)
            panel.ngOnInit()
            expect(addEventListenerSpy).toHaveBeenCalledWith("mousedown", expect.any(Function))
        })

        it("should unsubscribe mousedown events when destroyed", () => {
            const removeEventListenerSpy = jest.spyOn(document, "removeEventListener")
            const panel = TestBed.inject(RibbonBarPanelComponent)
            panel.ngOnInit()
            panel.ngOnDestroy()
            expect(removeEventListenerSpy).toHaveBeenCalledWith("mousedown", expect.any(Function))
        })

        it("should close on outside clicks", async () => {
            await userEvent.click(panel.querySelector(".section-title"))
            await waitFor(() => expect(panel.classList).toContain("expanded"))

            await userEvent.click(document.body)
            await waitFor(() => expect(panel.classList).not.toContain("expanded"))
        })

        it("should not close when clicking inside", async () => {
            await userEvent.click(panel.querySelector(".section-title"))
            await waitFor(() => expect(panel.classList).toContain("expanded"))

            await userEvent.click(panel.querySelector("cc-ribbon-bar-panel-settings"))
            await waitFor(() => expect(panel.classList).toContain("expanded"))
        })
    })
})
