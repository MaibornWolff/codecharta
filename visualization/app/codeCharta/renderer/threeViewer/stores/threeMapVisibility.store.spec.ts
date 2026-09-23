import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { BehaviorSubject, firstValueFrom } from "rxjs"
import { LayoutAlgorithm } from "../../../model/codeCharta.model"
import { ActiveViewStore } from "../../../routing/activeView.store"
import { ViewId } from "../../../routing/routePaths"
import { defaultState } from "../../../stores/rootStore/state.manager"
import { ThreeMapVisibilityStore } from "./threeMapVisibility.store"

describe("ThreeMapVisibilityStore", () => {
    let activeView$: BehaviorSubject<ViewId>

    function setup(activeView: ViewId, layoutAlgorithm: LayoutAlgorithm) {
        activeView$ = new BehaviorSubject(activeView)
        const state = { ...defaultState, mapState: { ...defaultState.mapState, layoutAlgorithm } }
        TestBed.configureTestingModule({
            providers: [
                provideMockStore({ initialState: state }),
                { provide: State, useValue: { getValue: () => state } },
                { provide: ActiveViewStore, useValue: { activeView$, currentView: () => activeView$.getValue() } }
            ]
        })
        return TestBed.inject(ThreeMapVisibilityStore)
    }

    it("should show the 3D map in the metrics view with a 3D layout", async () => {
        // Act
        const store = setup("metrics", LayoutAlgorithm.SquarifiedTreeMap)

        // Assert
        expect(store.isMapShown()).toBe(true)
        expect(await firstValueFrom(store.isMapShown$)).toBe(true)
    })

    it("should not show the 3D map while another layout draws the metrics view", async () => {
        // Act
        const store = setup("metrics", LayoutAlgorithm.Sunburst)

        // Assert
        expect(store.isMapShown()).toBe(false)
        expect(await firstValueFrom(store.isMapShown$)).toBe(false)
    })

    it("should not show the 3D map while another view is open", async () => {
        // Act
        const store = setup("domain", LayoutAlgorithm.SquarifiedTreeMap)

        // Assert
        expect(store.isMapShown()).toBe(false)
        expect(await firstValueFrom(store.isMapShown$)).toBe(false)
    })
})
