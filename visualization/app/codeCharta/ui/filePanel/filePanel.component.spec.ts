import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { render } from "@testing-library/angular"
import { FileSelectionModeService } from "../../../codeCharta/ui/filePanel/fileSelectionMode.service"
import { isDeltaStateSelector } from "../../state/selectors/isDeltaState.selector"
import { FilePanelComponent } from "./filePanel.component"

describe("filePanelComponent", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [FilePanelComponent],
            providers: [FileSelectionModeService, { provide: State, useValue: {} }]
        })
    })

    it("should render delta-selector when in delta mode", async () => {
        const { container } = await render(FilePanelComponent, {
            excludeComponentDeclaration: true,
            providers: [provideMockStore({ selectors: [{ selector: isDeltaStateSelector, value: true }] })]
        })
        expect(container.querySelector("cc-file-panel-delta-selector")).not.toBe(null)
        expect(container.querySelector("cc-file-panel-file-selector")).toBe(null)
    })

    it("should render file-selector when not in delta mode", async () => {
        const { container } = await render(FilePanelComponent, {
            excludeComponentDeclaration: true,
            providers: [provideMockStore({ selectors: [{ selector: isDeltaStateSelector, value: false }] })]
        })
        expect(container.querySelector("cc-file-panel-file-selector")).not.toBe(null)
        expect(container.querySelector("cc-file-panel-delta-selector")).toBe(null)
    })
})
