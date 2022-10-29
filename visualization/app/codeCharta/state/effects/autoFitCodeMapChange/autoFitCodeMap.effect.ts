import { Inject, Injectable } from "@angular/core"
import { switchMap, filter, skip, take, tap, combineLatest } from "rxjs"
import { ThreeOrbitControlsService } from "../../../ui/codeMap/threeViewer/threeOrbitControls.service"
import { createEffect } from "../../angular-redux/effects/createEffect"
import { State } from "../../angular-redux/state"
import { Store } from "../../angular-redux/store"
import { visibleFileStatesSelector } from "../../selectors/visibleFileStates.selector"
import { layoutAlgorithmSelector } from "../../store/appSettings/layoutAlgorithm/layoutAlgorithm.selector"
import { resetCameraIfNewFileIsLoadedSelector } from "../../store/appSettings/resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.selector"
import { focusedNodePathSelector } from "../../store/dynamicSettings/focusedNodePath/focusedNodePath.selector"
import { RenderCodeMapEffect } from "../renderCodeMapEffect/renderCodeMap.effect"

@Injectable()
export class AutoFitCodeMapEffect {
	constructor(
		@Inject(Store) private store: Store,
		@Inject(State) private state: State,
		@Inject(RenderCodeMapEffect) private renderCodeMapEffect: RenderCodeMapEffect,
		@Inject(ThreeOrbitControlsService) private threeOrbitControlsService: ThreeOrbitControlsService
	) {}

	autoFitTo$ = createEffect(
		() =>
			combineLatest([
				this.store.select(visibleFileStatesSelector),
				this.store.select(focusedNodePathSelector),
				this.store.select(layoutAlgorithmSelector)
			]).pipe(
				skip(1), // initial map load is already fitted
				filter(() => resetCameraIfNewFileIsLoadedSelector(this.state.getValue())),
				switchMap(() => this.renderCodeMapEffect.renderCodeMap$.pipe(take(1))),
				tap(() => {
					this.threeOrbitControlsService.autoFitTo()
				})
			),
		{ dispatch: false }
	)
}
