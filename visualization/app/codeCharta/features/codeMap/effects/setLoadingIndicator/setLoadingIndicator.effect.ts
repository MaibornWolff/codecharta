import { Injectable } from "@angular/core"
import { createEffect } from "@ngrx/effects"
import { Store } from "@ngrx/store"
import { debounceTime, filter, map, race, skip, switchMap, take, timer } from "rxjs"
import { CcState } from "../../../../model/codeCharta.model"
import { FileStoreReadWindow, setIsLoadingFile, visibleFileStatesSelector } from "../../../../stores/fileStore/fileStore.facade"
import { RenderCodeMapEffect } from "../renderCodeMapEffect/renderCodeMap.effect"

export const LOADING_INDICATOR_QUIET_PERIOD_MS = 350

/**
 * The last-resort deadline for a load that never renders. It is deliberately far longer than any real
 * load: the indicator is armed the moment a load STARTS (before the file is even fetched), so a deadline
 * anywhere near a plausible load time would dismiss the spinner mid-load — which does not merely look
 * wrong, it tells the rest of the app the load is done while it is still writing to the store.
 */
export const LOADING_INDICATOR_MAX_WAIT_MS = 60_000

/**
 * Step 7 of the post-load reconciliation: the loading indicator goes down when the map it was raised
 * for is on screen.
 *
 * Together with LoadFilesUseCase — which raises it at the start of every load, before the fetch —
 * this is the only place that writes isLoadingFile. It used to have five writers, one of them an
 * imperative boolean living outside the store.
 */
@Injectable()
export class LoadingIndicatorEffect {
    constructor(
        private readonly store: Store<CcState>,
        private readonly fileStoreReadWindow: FileStoreReadWindow,
        private readonly renderCodeMapEffect: RenderCodeMapEffect
    ) {}

    /** A file-panel change (delta switch, file removal, re-selection) rebuilds the map too. */
    showOnFileSelectionChange$ = createEffect(() =>
        this.store.select(visibleFileStatesSelector).pipe(
            skip(1),
            map(() => setIsLoadingFile({ value: true }))
        )
    )

    hideAfterRender$ = createEffect(() =>
        this.fileStoreReadWindow.isLoadingFile$.pipe(
            filter(Boolean),
            switchMap(() =>
                race(
                    // Wait for the burst of late-arriving renders (blacklist apply, autoFit) to settle,
                    // otherwise the user sees the map jump right after the spinner clears.
                    this.renderCodeMapEffect.renderCodeMap$.pipe(debounceTime(LOADING_INDICATOR_QUIET_PERIOD_MS), take(1)),
                    // A load that produces no renderable map must not leave the spinner up forever.
                    timer(LOADING_INDICATOR_MAX_WAIT_MS)
                )
            ),
            map(() => setIsLoadingFile({ value: false }))
        )
    )
}
