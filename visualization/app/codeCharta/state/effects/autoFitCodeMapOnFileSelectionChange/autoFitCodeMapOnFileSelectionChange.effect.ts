import { Inject, Injectable } from "@angular/core"
import { concatMap, filter, skip, take, tap } from "rxjs"
import { ThreeOrbitControlsService } from "../../../ui/codeMap/threeViewer/threeOrbitControlsService"
import { createEffect } from "../../angular-redux/effects/createEffect"
import { State } from "../../angular-redux/state"
import { Store } from "../../angular-redux/store"
import { visibleFileStatesSelector } from "../../selectors/visibleFileStates.selector"
import { resetCameraIfNewFileIsLoadedSelector } from "../../store/appSettings/resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.selector"
import { RenderCodeMapEffect } from "../renderCodeMapEffect/renderCodeMap.effect"

// don't inject AngularJS services, as AngularJS is not yet bootstrapped when Effects are bootstrapped
@Injectable()
export class AutoFitCodeMapOnFileSelectionChangeEffect {
	constructor(
		@Inject(Store) private store: Store,
		@Inject(State) private state: State,
		@Inject(RenderCodeMapEffect) private renderCodeMapEffect: RenderCodeMapEffect
	) {}

	autoFitCodeMapOnFileSelectionChange$ = createEffect(
		() =>
			this.store.select(visibleFileStatesSelector).pipe(
				skip(1), // initial map load is already fitted
				filter(() => resetCameraIfNewFileIsLoadedSelector(this.state.getValue())),
				concatMap(() => this.renderCodeMapEffect.renderCodeMap$.pipe(take(1))),
				tap(() => {
					ThreeOrbitControlsService.instance?.autoFitTo()
				})
			),
		{ dispatch: false }
	)
}
