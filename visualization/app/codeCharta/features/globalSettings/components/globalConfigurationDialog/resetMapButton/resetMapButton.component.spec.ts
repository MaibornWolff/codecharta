import { HttpClient } from "@angular/common/http"
import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { METRIC_DATA } from "../../../../../mocks/dataMocks"
import { nodeMetricDataSelector } from "../../../../../renderer/renderModel/nodeMetricData/nodeMetricData.selector"
import { LoadFileService } from "../../../../../stores/fileStore/fileStore.facade"
import { defaultState } from "../../../../../stores/rootStore/state.manager"
import { ResetMapButtonComponent } from "./resetMapButton.component"

describe("ResetMapButtonComponent", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ResetMapButtonComponent],
            providers: [
                { provide: State, useValue: { getValue: () => defaultState } },
                { provide: LoadFileService, useValue: { loadFiles: jest.fn() } },
                { provide: HttpClient, useValue: {} },
                provideMockStore({
                    selectors: [{ selector: nodeMetricDataSelector, value: METRIC_DATA }]
                })
            ]
        })

        HTMLDialogElement.prototype.showModal = jest.fn()
        HTMLDialogElement.prototype.close = jest.fn()
    })

    it("should open the confirm reset map dialog on button click", async () => {
        // Arrange
        const { fixture } = await render(ResetMapButtonComponent)
        const openSpy = jest.spyOn(fixture.componentInstance.confirmDialog(), "open")

        // Act
        await userEvent.click(screen.getByRole("button", { name: "Reset map" }))

        // Assert
        expect(openSpy).toHaveBeenCalled()
    })
})
