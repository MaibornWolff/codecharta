import { TestBed } from "@angular/core/testing"
import { Store } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { firstValueFrom } from "rxjs"
import { EXPLORER_SORT, ExplorerSort, provideExplorerSort } from "../../../features/sidebarExplorer/facade"
import { provideMockState } from "../../../mocks/state.mocks"
import { SortingOption } from "../../../model/codeCharta.model"
import { sortingOrderAscendingSelector, sortingOrderSelector } from "../../../stores/preferences/preferences.read.facade"
import { setSortingOption, toggleSortingOrderAscending } from "../../../stores/preferences/preferences.write.facade"
import { METRICS_EXPLORER_SORT } from "./metricsExplorerSort"

describe("METRICS_EXPLORER_SORT", () => {
    function setup() {
        TestBed.configureTestingModule({
            providers: [
                provideExplorerSort(METRICS_EXPLORER_SORT),
                provideMockState(),
                provideMockStore({
                    selectors: [
                        { selector: sortingOrderSelector, value: SortingOption.AREA_SIZE },
                        { selector: sortingOrderAscendingSelector, value: false }
                    ]
                })
            ]
        })
        const dispatchSpy = jest.spyOn(TestBed.inject(Store), "dispatch")
        return { sort: TestBed.inject<ExplorerSort>(EXPLORER_SORT), dispatchSpy }
    }

    it("should stream the global preferences sort option and order", async () => {
        // Arrange
        const { sort } = setup()

        // Act & Assert — the map view's sort IS the global preferences.sorting
        expect(await firstValueFrom(sort.option$)).toBe(SortingOption.AREA_SIZE)
        expect(await firstValueFrom(sort.ascending$)).toBe(false)
    })

    it("should dispatch the global setSortingOption on setOption", () => {
        // Arrange
        const { sort, dispatchSpy } = setup()

        // Act
        sort.setOption(SortingOption.NUMBER_OF_FILES)

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setSortingOption({ value: SortingOption.NUMBER_OF_FILES }))
    })

    it("should dispatch the global toggleSortingOrderAscending on toggleAscending", () => {
        // Arrange
        const { sort, dispatchSpy } = setup()

        // Act
        sort.toggleAscending()

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(toggleSortingOrderAscending())
    })
})
