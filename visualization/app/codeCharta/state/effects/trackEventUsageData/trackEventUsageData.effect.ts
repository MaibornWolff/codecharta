import { Inject, Injectable } from "@angular/core"
import { combineLatest, filter, map, tap, withLatestFrom } from "rxjs"
import { isActionOfType } from "../../../util/reduxHelper"
import { trackEventUsageData } from "../../../util/usageDataTracker"
import { createEffect } from "../../angular-redux/effects/createEffect"
import { Actions, ActionsToken } from "../../angular-redux/effects/effects.module"
import { Store } from "../../angular-redux/store"
import { areAllNecessaryRenderDataAvailableSelector } from "../../selectors/allNecessaryRenderDataAvailable/areAllNecessaryRenderDataAvailable.selector"
import { AreaMetricActions } from "../../store/dynamicSettings/areaMetric/areaMetric.actions"
import { ColorMetricActions } from "../../store/dynamicSettings/colorMetric/colorMetric.actions"
import { ColorRangeActions } from "../../store/dynamicSettings/colorRange/colorRange.actions"
import { FocusedNodePathActions } from "../../store/dynamicSettings/focusedNodePath/focusedNodePath.actions"
import { HeightMetricActions } from "../../store/dynamicSettings/heightMetric/heightMetric.actions"
import { filesSelector } from "../../store/files/files.selector"
import { BlacklistActions } from "../../store/fileSettings/blacklist/blacklist.actions"

const actionsToTrackWithPayload = [
	AreaMetricActions,
	HeightMetricActions,
	ColorMetricActions,
	ColorRangeActions,
	BlacklistActions,
	FocusedNodePathActions
]

@Injectable()
export class TrackEventUsageDataEffect {
	private areAllNecessaryRenderDataAvailable$ = this.store.select(areAllNecessaryRenderDataAvailableSelector)
	private files$ = this.store.select(filesSelector)

	constructor(@Inject(ActionsToken) private actions$: Actions, @Inject(Store) private store: Store) {}

	trackActionsWithPayload$ = createEffect(
		() =>
			combineLatest([this.actions$, this.areAllNecessaryRenderDataAvailable$]).pipe(
				filter(
					([action, areAllNecessaryRenderDataAvailable]) =>
						areAllNecessaryRenderDataAvailable &&
						actionsToTrackWithPayload.some(actionToTrack => isActionOfType(action.type, actionToTrack))
				),
				map(([action]) => action),
				withLatestFrom(this.files$),
				tap(([action, files]) => {
					console.log(action.type, "TrackEventUsageDataEffect")
					// trackEventUsageData(action.type, files, action["payload"])
				})
			),
		{ dispatch: false }
	)
}
