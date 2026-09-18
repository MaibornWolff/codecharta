import { BehaviorSubject, firstValueFrom } from "rxjs"
import { ViewReadinessStore } from "../../../routing/viewReadiness.store"
import { FileStoreReadWindow } from "../../../stores/fileStore/fileStore.facade"
import { setIsApplyingScenario } from "../../../util/busy/isApplyingScenario"
import { beginPendingSave, endPendingSave } from "../../../util/busy/isPendingSave"
import { clearLoadPhase, setLoadPhase } from "../../../util/busy/loadPhase"
import { isPendingHeavyDispatch$ } from "../../../util/dispatchAfterPaint"
import { LoadingFileProgressSpinnerService } from "./loadingFileProgressSpinner.service"

describe("LoadingFileProgressSpinnerService", () => {
    let viewReadinessStore: ViewReadinessStore
    let isLoadingFile$: BehaviorSubject<boolean>
    let service: LoadingFileProgressSpinnerService

    beforeEach(() => {
        viewReadinessStore = new ViewReadinessStore()
        isLoadingFile$ = new BehaviorSubject(false)
        service = new LoadingFileProgressSpinnerService(viewReadinessStore, { isLoadingFile$ } as unknown as FileStoreReadWindow)
        isPendingHeavyDispatch$.next(false)
        setIsApplyingScenario(false)
    })

    afterEach(() => {
        isPendingHeavyDispatch$.next(false)
        setIsApplyingScenario(false)
        endPendingSave()
        clearLoadPhase()
    })

    it("should report a view busy while it is still stale", async () => {
        // Assert — nothing has rendered yet
        expect(await firstValueFrom(service.isLoading$("domain"))).toBe(true)
    })

    it("should report a ready view idle even while the other view is still stale", async () => {
        // Arrange — the domain view has caught up, the map has not
        viewReadinessStore.markReady("domain")

        // Act
        const isDomainLoading = await firstValueFrom(service.isLoading$("domain"))
        const isMetricsLoading = await firstValueFrom(service.isLoading$("metrics"))

        // Assert — this is the whole point of the split: domain must not wait on the map
        expect(isDomainLoading).toBe(false)
        expect(isMetricsLoading).toBe(true)
    })

    it("should report busy while a heavy dispatch is in flight", async () => {
        // Arrange
        viewReadinessStore.markReady("domain")

        // Act
        isPendingHeavyDispatch$.next(true)

        // Assert
        expect(await firstValueFrom(service.isLoading$("domain"))).toBe(true)
    })

    it("should report every view busy while a load is in flight", async () => {
        // Arrange — until the load commits there is nothing new for any view to show
        viewReadinessStore.markReady("domain")
        viewReadinessStore.markReady("metrics")

        // Act
        isLoadingFile$.next(true)

        // Assert
        expect(await firstValueFrom(service.isLoading$("domain"))).toBe(true)
        expect(await firstValueFrom(service.isLoading$("metrics"))).toBe(true)
    })

    it("should report a view idle again once a failed load lowers the flag", async () => {
        // Arrange — a load that never commits must not leave the spinner up
        viewReadinessStore.markReady("domain")
        isLoadingFile$.next(true)

        // Act
        isLoadingFile$.next(false)

        // Assert
        expect(await firstValueFrom(service.isLoading$("domain"))).toBe(false)
    })

    it("should report busy while a scenario is being applied", async () => {
        // Arrange — a scenario rewrites the settings behind every view at once
        viewReadinessStore.markReady("domain")

        // Act
        setIsApplyingScenario(true)

        // Assert
        expect(await firstValueFrom(service.isLoading$("domain"))).toBe(true)
    })

    it("should name the phase the loader announced", async () => {
        // Arrange
        viewReadinessStore.markReady("metrics")

        // Act
        setLoadPhase("Reading project.cc.json")

        // Assert
        expect(await firstValueFrom(service.phase$("metrics"))).toBe("Reading project.cc.json")
    })

    it("should say the map is being drawn once the loader has handed it over", async () => {
        // Arrange & Act — the commit cleared the announced phase and left every view stale
        clearLoadPhase()

        // Assert
        expect(await firstValueFrom(service.phase$("metrics"))).toBe("Drawing the map")
    })

    it("should say the word cloud is being drawn on the domain view", async () => {
        // Arrange & Act
        clearLoadPhase()

        // Assert
        expect(await firstValueFrom(service.phase$("domain"))).toBe("Drawing the word cloud")
    })

    it("should say the map is being drawn while a heavy dispatch is in flight", async () => {
        // Arrange
        viewReadinessStore.markReady("metrics")

        // Act
        isPendingHeavyDispatch$.next(true)

        // Assert
        expect(await firstValueFrom(service.phase$("metrics"))).toBe("Drawing the map")
    })

    it("should say the session is being saved while the save is still in flight", async () => {
        // Arrange — the view is still waiting to be drawn, so this says which of the two wins
        viewReadinessStore.markAllStale()

        // Act
        beginPendingSave()

        // Assert
        expect(await firstValueFrom(service.phase$("metrics"))).toBe("Saving your session")
    })

    it("should say nothing once the view is drawn and nothing is being saved", async () => {
        // Arrange & Act
        viewReadinessStore.markReady("metrics")

        // Assert
        expect(await firstValueFrom(service.phase$("metrics"))).toBeNull()
    })
})
