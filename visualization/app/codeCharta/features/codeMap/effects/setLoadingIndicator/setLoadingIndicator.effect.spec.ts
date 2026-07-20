import { TestBed } from "@angular/core/testing"
import { Router } from "@angular/router"
import { EffectsModule } from "@ngrx/effects"
import { provideMockActions } from "@ngrx/effects/testing"
import { Action } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { BehaviorSubject, Subject, Subscription } from "rxjs"
import { routeLinks } from "../../../../routing/routePaths"
import { FileStoreReadWindow, filesLoaded, setIsLoadingFile } from "../../../../stores/fileStore/fileStore.facade"
import { visibleFileStatesSelector } from "../../../../stores/fileStore/store/visibleFileStates.selector"
import { defaultState } from "../../../../stores/rootStore/state.manager"
import { NO_URL_METRICS } from "../../../../util/queryParameter/queryParameter"
import { wait } from "../../../../util/testUtils/wait"
import { maxFPS, RenderCodeMapEffect } from "../renderCodeMapEffect/renderCodeMap.effect"
import { LOADING_INDICATOR_MAX_WAIT_MS, LOADING_INDICATOR_QUIET_PERIOD_MS, LoadingIndicatorEffect } from "./setLoadingIndicator.effect"

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
    let isLoadingFile$: BehaviorSubject<boolean>
    let scannedActions: Action[]
    let subscription: Subscription
    let router: { url: string }

    beforeEach(() => {
        actions$ = new Subject<Action>()
        mockedRenderCodeMap$ = new Subject()
        isLoadingFile$ = new BehaviorSubject(false)
        router = { url: routeLinks.metrics }

        TestBed.configureTestingModule({
            imports: [EffectsModule.forRoot([LoadingIndicatorEffect])],
            providers: [
                { provide: RenderCodeMapEffect, useValue: { renderCodeMap$: mockedRenderCodeMap$ } },
                { provide: FileStoreReadWindow, useValue: { isLoadingFile$ } },
                { provide: Router, useValue: router },
                provideMockStore({
                    initialState: defaultState,
                    selectors: [{ selector: visibleFileStatesSelector, value: [] }]
                }),
                provideMockActions(() => actions$)
            ]
        })

        store = TestBed.inject(MockStore)
        scannedActions = []
        subscription = store.scannedActions$.subscribe(action => scannedActions.push(action))
    })

    afterEach(() => {
        subscription.unsubscribe()
        actions$.complete()
        store.resetSelectors()
    })

    it("should show the loading indicator when the visible file set changes", () => {
        // Act
        store.overrideSelector(visibleFileStatesSelector, [{}] as never)
        store.refreshState()

        // Assert
        expect(scannedActions).toContainEqual(setIsLoadingFile({ value: true }))
    })

    it("should not show the loading indicator for the initial emission at boot", () => {
        // Assert — the skipped first emission must not raise it
        expect(scannedActions).not.toContainEqual(setIsLoadingFile({ value: true }))
    })

    it("should hide the loading indicator only after a quiet period following the render", async () => {
        // Arrange
        isLoadingFile$.next(true)

        // Act — right after the render the indicator must NOT be dismissed yet: the debounce keeps it
        // up until the burst of late renders (blacklist apply, autoFit) settles.
        mockedRenderCodeMap$.next("")
        await wait(maxFPS)

        // Assert
        expect(scannedActions).not.toContainEqual(setIsLoadingFile({ value: false }))

        // Act
        await wait(LOADING_INDICATOR_QUIET_PERIOD_MS + maxFPS)

        // Assert
        expect(scannedActions).toContainEqual(setIsLoadingFile({ value: false }))
    })

    it("should hide the loading indicator on a non-map route once the load commits and the file set settles", async () => {
        // Arrange — a load raises the indicator before the files are even fetched, so it waits for the commit
        router.url = routeLinks.domain
        isLoadingFile$.next(true)

        // Act
        actions$.next(filesLoadedAction())
        store.overrideSelector(visibleFileStatesSelector, [{}] as never)
        store.refreshState()
        await wait(LOADING_INDICATOR_QUIET_PERIOD_MS + maxFPS)

        // Assert
        expect(scannedActions).toContainEqual(setIsLoadingFile({ value: false }))
    })

    it("should NOT hide the loading indicator on a non-map route while the load is still in flight", async () => {
        // Arrange — no filesLoaded yet, so the files have not reached the store
        router.url = routeLinks.domain
        isLoadingFile$.next(true)

        // Act
        await wait(LOADING_INDICATOR_QUIET_PERIOD_MS + maxFPS)

        // Assert — clearing here would drop the spinner mid-load
        expect(scannedActions).not.toContainEqual(setIsLoadingFile({ value: false }))
    })

    it("should hide the loading indicator on a non-map route when the file-selection change is itself the last emission", async () => {
        // Arrange — a file-panel change raises the indicator and nothing emits after it. Waiting for a
        // SUBSEQUENT file-set emission would hang here until the max-wait deadline.
        router.url = routeLinks.domain

        // Act
        store.overrideSelector(visibleFileStatesSelector, [{}] as never)
        store.refreshState()
        isLoadingFile$.next(true)
        await wait(LOADING_INDICATOR_QUIET_PERIOD_MS + maxFPS)

        // Assert
        expect(scannedActions).toContainEqual(setIsLoadingFile({ value: false }))
    })

    it("should NOT hide on the map route from the file-set emission alone (it waits for the render)", async () => {
        // Arrange — on the metrics route the spinner must wait for renderCodeMap$, not the file set
        router.url = routeLinks.metrics
        isLoadingFile$.next(true)

        // Act
        store.overrideSelector(visibleFileStatesSelector, [{}] as never)
        store.refreshState()
        await wait(LOADING_INDICATOR_QUIET_PERIOD_MS + maxFPS)

        // Assert — no render happened, so it stays up
        expect(scannedActions).not.toContainEqual(setIsLoadingFile({ value: false }))
    })

    it("should not hide the loading indicator while it is already down", async () => {
        // Act — no load is in flight, so a render must not dispatch anything
        mockedRenderCodeMap$.next("")
        await wait(LOADING_INDICATOR_QUIET_PERIOD_MS + maxFPS)

        // Assert
        expect(scannedActions).not.toContainEqual(setIsLoadingFile({ value: false }))
    })

    it("should hide the loading indicator after the maximum wait even when no render occurs", () => {
        // Arrange — a load that produces no renderable map must not leave the spinner up forever
        jest.useFakeTimers()
        isLoadingFile$.next(true)

        // Act
        jest.advanceTimersByTime(LOADING_INDICATOR_MAX_WAIT_MS + 1)

        // Assert
        expect(scannedActions).toContainEqual(setIsLoadingFile({ value: false }))
        jest.useRealTimers()
    })

    it("should not hide the loading indicator before the maximum wait when no render occurs", () => {
        // Arrange — the deadline must never fire while a slow load is still in flight
        jest.useFakeTimers()
        isLoadingFile$.next(true)

        // Act
        jest.advanceTimersByTime(LOADING_INDICATOR_MAX_WAIT_MS - 1)

        // Assert
        expect(scannedActions).not.toContainEqual(setIsLoadingFile({ value: false }))
        jest.useRealTimers()
    })
})
