import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { createEffect } from "@ngrx/effects"
import { switchMap, filter, skip, take, tap, combineLatest, withLatestFrom } from "rxjs"
import { CcState } from "../../../codeCharta.model"
import { ThreeOrbitControlsService } from "../../../ui/codeMap/threeViewer/threeOrbitControls.service"
import { visibleFileStatesSelector } from "../../selectors/visibleFileStates.selector"
import { layoutAlgorithmSelector } from "../../store/appSettings/layoutAlgorithm/layoutAlgorithm.selector"
import { resetCameraIfNewFileIsLoadedSelector } from "../../store/appSettings/resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.selector"
import { focusedNodePathSelector } from "../../store/dynamicSettings/focusedNodePath/focusedNodePath.selector"
import { RenderCodeMapEffect } from "../renderCodeMapEffect/renderCodeMap.effect"

@Injectable()
export class AutoFitCodeMapEffect {
	constructor(
		private store: Store<CcState>,
		private renderCodeMapEffect: RenderCodeMapEffect,
		private threeOrbitControlsService: ThreeOrbitControlsService
	) {}

	autoFitTo$ = createEffect(
		() =>
			combineLatest([
				this.store.select(visibleFileStatesSelector),
				this.store.select(focusedNodePathSelector),
				this.store.select(layoutAlgorithmSelector)
			]).pipe(
				skip(1), // initial map load is already fitted
				withLatestFrom(this.store.select(resetCameraIfNewFileIsLoadedSelector)),
				filter(([, resetCameraIfNewFileIsLoaded]) => resetCameraIfNewFileIsLoaded),
				switchMap(() => this.renderCodeMapEffect.renderCodeMap$.pipe(take(1))),
				tap(() => {
					this.threeOrbitControlsService.autoFitTo()
				})
			),
		{ dispatch: false }
	)
}
