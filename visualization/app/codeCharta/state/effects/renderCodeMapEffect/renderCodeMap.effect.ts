import { Inject, Injectable } from "@angular/core"
import { asyncScheduler, combineLatest, filter, tap, throttleTime } from "rxjs"
import { CodeMapRenderService } from "../../../ui/codeMap/codeMap.render.service"
import { ThreeRendererService } from "../../../ui/codeMap/threeViewer/threeRenderer.service"
import { UploadFilesService } from "../../../ui/toolBar/uploadFilesButton/uploadFiles.service"
import { isActionOfType } from "../../../util/reduxHelper"
import { createEffect } from "../../angular-redux/effects/createEffect"
import { Actions, ActionsToken } from "../../angular-redux/effects/effects.module"
import { Store } from "../../angular-redux/store"
import { accumulatedDataSelector } from "../../selectors/accumulatedData/accumulatedData.selector"
import { setIsLoadingFile } from "../../store/appSettings/isLoadingFile/isLoadingFile.actions"
import { setIsLoadingMap } from "../../store/appSettings/isLoadingMap/isLoadingMap.actions"
import { ScalingActions } from "../../store/appSettings/scaling/scaling.actions"
import { actionsRequiringRerender } from "./actionsRequiringRerender"

export const maxFPS = 1000 / 60

@Injectable()
export class RenderCodeMapEffect {
	constructor(
		private store: Store,
		@Inject(ActionsToken) private actions$: Actions,
		private uploadFilesService: UploadFilesService,
		private threeRendererService: ThreeRendererService,
		private codeMapRenderService: CodeMapRenderService
	) {}

	private actionsRequiringRender$ = this.actions$.pipe(
		filter(action => actionsRequiringRerender.some(actions => isActionOfType(action.type, actions)))
	)

	renderCodeMap$ = createEffect(
		() =>
			combineLatest([this.store.select(accumulatedDataSelector), this.actionsRequiringRender$]).pipe(
				filter(([accumulatedData]) => Boolean(accumulatedData.unifiedMapNode)),
				throttleTime(maxFPS, asyncScheduler, { leading: false, trailing: true }),
				tap(([accumulatedData, action]) => {
					this.codeMapRenderService.render(accumulatedData.unifiedMapNode)
					this.threeRendererService.render()
					if (isActionOfType(action.type, ScalingActions)) {
						this.codeMapRenderService.scaleMap()
					}
				})
			),
		{ dispatch: false }
	)

	removeLoadingIndicatorAfterRender$ = createEffect(
		() =>
			this.renderCodeMap$.pipe(
				filter(() => !this.uploadFilesService.isUploading),
				tap(() => {
					this.store.dispatch(setIsLoadingFile(false))
					this.store.dispatch(setIsLoadingMap(false))
				})
			),
		{ dispatch: false }
	)
}
