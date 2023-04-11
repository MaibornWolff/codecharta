import { Injectable } from "@angular/core"
import { Actions, createEffect, ofType } from "@ngrx/effects"
import { fileActions } from "../../store/files/files.actions"
import { map } from "rxjs"
import { setIsLoadingFile } from "../../store/appSettings/isLoadingFile/isLoadingFile.actions"
import { actionsRequiringRerender } from "../renderCodeMapEffect/actionsRequiringRerender"
import { setIsLoadingMap } from "../../store/appSettings/isLoadingMap/isLoadingMap.actions"

@Injectable()
export class SetLoadingIndicatorEffect {
	constructor(private actions$: Actions) {}

	setIsLoadingFile$ = createEffect(() =>
		this.actions$.pipe(
			ofType(...fileActions),
			map(() => setIsLoadingFile({ value: true }))
		)
	)

	setIsLoadingMap$ = createEffect(() =>
		this.actions$.pipe(
			ofType(...actionsRequiringRerender),
			map(() => setIsLoadingMap({ value: true }))
		)
	)
}
