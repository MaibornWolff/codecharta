import { BehaviorSubject, firstValueFrom } from "rxjs"
import { ViewReadinessStore } from "../../../routing/viewReadiness.store"
import { FileStoreReadWindow } from "../../../stores/fileStore/fileStore.facade"
import { setIsApplyingScenario } from "../../../util/busy/isApplyingScenario"
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
})
