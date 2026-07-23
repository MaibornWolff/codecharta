import { TestBed } from "@angular/core/testing"
import { EffectsModule } from "@ngrx/effects"
import { provideMockActions } from "@ngrx/effects/testing"
import { Action } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { Subject, Subscription } from "rxjs"
import { ViewReadinessStore } from "../../../../routing/viewReadiness.store"
import { filesLoaded, setIsLoadingFile } from "../../../../stores/fileStore/fileStore.facade"
import { visibleFileStatesSelector } from "../../../../stores/fileStore/store/visibleFileStates.selector"
import { defaultState } from "../../../../stores/rootStore/state.manager"
import { addBlacklistItem } from "../../../../stores/sharedView/sharedView.write.facade"
import { NO_URL_METRICS } from "../../../../util/queryParameter/queryParameter"
import { wait } from "../../../../util/testUtils/wait"
import { maxFPS, RenderCodeMapEffect } from "../renderCodeMapEffect/renderCodeMap.effect"
import { LoadingIndicatorEffect, RENDER_QUIET_PERIOD_MS } from "./setLoadingIndicator.effect"

const filesLoadedAction = () =>
    filesLoaded({
        source: "upload",
        areSampleFiles: false,
        urlMetrics: NO_URL_METRICS,
        forceAutoFit: false,
        forceDefaultMetrics: false,
        restoredSettings: null
    })

describe("LoadingIndicatorEffect", () => {
    let actions$: Subject<Action>
    let store: MockStore
    let mockedRenderCodeMap$: Subject<unknown>
    let viewReadinessStore: ViewReadinessStore
    let scannedActions: Action[]
    let subscription: Subscription

    beforeEach(() => {
        actions$ = new Subject<Action>()
        mockedRenderCodeMap$ = new Subject()

        TestBed.configureTestingModule({
            imports: [EffectsModule.forRoot([LoadingIndicatorEffect])],
            providers: [
                { provide: RenderCodeMapEffect, useValue: { renderCodeMap$: mockedRenderCodeMap$ } },
                provideMockStore({
                    initialState: defaultState,
                    selectors: [{ selector: visibleFileStatesSelector, value: [] }]
                }),
                provideMockActions(() => actions$)
            ]
        })

        store = TestBed.inject(MockStore)
        viewReadinessStore = TestBed.inject(ViewReadinessStore)
        scannedActions = []
        subscription = store.scannedActions$.subscribe(action => scannedActions.push(action))
    })

    afterEach(() => {
        subscription.unsubscribe()
        actions$.complete()
        store.resetSelectors()
    })

    it("should lower the loading flag once the load commits", () => {
        // Act
        actions$.next(filesLoadedAction())

        // Assert
        expect(scannedActions).toContainEqual(setIsLoadingFile({ value: false }))
    })

    it("should not mark views stale merely because a load started", () => {
        // Arrange — a load that never commits (an invalid file) would otherwise leave the views waiting
        viewReadinessStore.markReady("metrics")
        viewReadinessStore.markReady("domain")

        // Act
        actions$.next(setIsLoadingFile({ value: true }))

        // Assert
        expect(viewReadinessStore.isStale("metrics")).toBe(false)
        expect(viewReadinessStore.isStale("domain")).toBe(false)
    })

    it("should leave the views ready when a load fails without committing", () => {
        // Arrange — the use-case lowers the flag on its failure path, and nothing was written
        viewReadinessStore.markReady("metrics")
        viewReadinessStore.markReady("domain")

        // Act
        actions$.next(setIsLoadingFile({ value: true }))
        actions$.next(setIsLoadingFile({ value: false }))

        // Assert — the content on screen is untouched and still correct
        expect(viewReadinessStore.isStale("metrics")).toBe(false)
        expect(viewReadinessStore.isStale("domain")).toBe(false)
    })

    it("should mark every view stale when the visible file set changes", () => {
        // Arrange
        viewReadinessStore.markReady("metrics")
        viewReadinessStore.markReady("domain")

        // Act
        store.overrideSelector(visibleFileStatesSelector, [{}] as never)
        store.refreshState()

        // Assert
        expect(viewReadinessStore.isStale("metrics")).toBe(true)
        expect(viewReadinessStore.isStale("domain")).toBe(true)
    })

    it("should not mark views stale for the initial file-set emission at boot", () => {
        // Arrange — nothing has happened yet beyond the effects registering
        viewReadinessStore.markReady("domain")

        // Assert
        expect(viewReadinessStore.isStale("domain")).toBe(false)
    })

    it("should mark every view stale when a node is excluded, so the hidden view rebuilds on switch", () => {
        // Arrange
        viewReadinessStore.markReady("metrics")
        viewReadinessStore.markReady("domain")

        // Act
        actions$.next(addBlacklistItem({ item: { path: "/root/foo", type: "exclude" } }))

        // Assert
        expect(viewReadinessStore.isStale("metrics")).toBe(true)
        expect(viewReadinessStore.isStale("domain")).toBe(true)
    })

    it("should mark the metrics view ready only after the render burst settles", async () => {
        // Act — the map jumps if the spinner clears on the first of a burst of late renders
        mockedRenderCodeMap$.next("")
        await wait(maxFPS)

        // Assert
        expect(viewReadinessStore.isStale("metrics")).toBe(true)

        // Act
        await wait(RENDER_QUIET_PERIOD_MS + maxFPS)

        // Assert
        expect(viewReadinessStore.isStale("metrics")).toBe(false)
    })

    it("should not mark the domain view ready when the map renders", async () => {
        // Act — the two views settle independently; a map render says nothing about the word cloud
        mockedRenderCodeMap$.next("")
        await wait(RENDER_QUIET_PERIOD_MS + maxFPS)

        // Assert
        expect(viewReadinessStore.isStale("domain")).toBe(true)
    })
})
