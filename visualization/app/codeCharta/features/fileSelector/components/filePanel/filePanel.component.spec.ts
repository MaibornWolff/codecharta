import { render, screen } from "@testing-library/angular"
import { FilePanelComponent } from "./filePanel.component"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { TestBed } from "@angular/core/testing"
import { isDeltaStateSelector } from "../../../../state/selectors/isDeltaState.selector"
import { Component } from "@angular/core"

@Component({ selector: "cc-state-buttons", template: "<div>StateButtons</div>", standalone: true })
class MockStateButtonsComponent {}

@Component({ selector: "cc-file-selector-dropdown", template: "<div>FileSelectorDropdown</div>", standalone: true })
class MockFileSelectorDropdownComponent {}

@Component({ selector: "cc-delta-selector", template: "<div>DeltaSelector</div>", standalone: true })
class MockDeltaSelectorComponent {}

describe("FilePanelComponent", () => {
    let store: MockStore

    afterEach(() => {
        TestBed.resetTestingModule()
    })

    async function renderComponent(isDeltaState: boolean) {
        const result = await render(FilePanelComponent, {
            componentImports: [MockStateButtonsComponent, MockFileSelectorDropdownComponent, MockDeltaSelectorComponent],
            providers: [
                provideMockStore({
                    selectors: [{ selector: isDeltaStateSelector, value: isDeltaState }]
                })
            ]
        })
        store = TestBed.inject(MockStore)
        return result
    }

    it("should render state buttons", async () => {
        // Arrange & Act
        await renderComponent(false)

        // Assert
        expect(screen.getByText("StateButtons")).toBeTruthy()
    })

    it("should render file selector dropdown in standard mode", async () => {
        // Arrange & Act
        await renderComponent(false)

        // Assert
        expect(screen.getByText("FileSelectorDropdown")).toBeTruthy()
        expect(screen.queryByText("DeltaSelector")).toBeNull()
    })

    it("should render delta selector in delta mode", async () => {
        // Arrange & Act
        await renderComponent(true)

        // Assert
        expect(screen.getByText("DeltaSelector")).toBeTruthy()
        expect(screen.queryByText("FileSelectorDropdown")).toBeNull()
    })
})
