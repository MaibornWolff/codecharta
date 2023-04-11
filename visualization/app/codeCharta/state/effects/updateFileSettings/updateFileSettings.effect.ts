import { Injectable } from "@angular/core"
import { Actions, createEffect, ofType } from "@ngrx/effects"
import { fileActions } from "../../store/files/files.actions"
import { setState } from "../../store/state.actions"
import { CcState } from "../../../codeCharta.model"
import { map } from "rxjs"
import { getVisibleFiles, isPartialState } from "../../../model/files/files.helper"
import { visibleFileStatesSelector } from "../../selectors/visibleFileStates.selector"
import { getMergedEdges } from "./utils/edges.merger"
import { getMergedMarkedPackages } from "./utils/markedPackages.merger"
import { getMergedBlacklist } from "./utils/blacklist.merger"
import { getMergedAttributeTypes } from "./utils/attributeTypes.merger"
import { getMergedAttributeDescriptors } from "./utils/attributeDescriptors.merger"
import { State } from "@ngrx/store"

@Injectable()
export class UpdateFileSettingsEffect {
	constructor(private actions$: Actions, private State: State<CcState>) {}

	updateFileSettings$ = createEffect(() =>
		this.actions$.pipe(
			ofType(...fileActions),
			map(() => {
				const state = this.State.getValue()
				const visibleFiles = getVisibleFiles(state.files)
				const withUpdatedPath = isPartialState(state.files)
				const allAttributeTypes = visibleFileStatesSelector(state).map(({ file }) => file.settings.fileSettings.attributeTypes)
				const allAttributeDescriptors = visibleFileStatesSelector(state).map(
					({ file }) => file.settings.fileSettings.attributeDescriptors
				)

				return setState({
					value: {
						fileSettings: {
							edges: getMergedEdges(visibleFiles, withUpdatedPath),
							markedPackages: getMergedMarkedPackages(visibleFiles, withUpdatedPath),
							blacklist: getMergedBlacklist(visibleFiles, withUpdatedPath),
							attributeTypes: getMergedAttributeTypes(allAttributeTypes),
							attributeDescriptors: getMergedAttributeDescriptors(allAttributeDescriptors)
						}
					}
				})
			})
		)
	)
}
