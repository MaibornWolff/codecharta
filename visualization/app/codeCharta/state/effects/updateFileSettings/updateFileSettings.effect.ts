import pako from "pako"
import stringify from "safe-stable-stringify"
import { Injectable } from "@angular/core"
import { Actions, createEffect, ofType } from "@ngrx/effects"
import { fileActions } from "../../store/files/files.actions"
import { setState } from "../../store/state.actions"
import { CcState, LocalStorageFiles, stateObjectReplacer } from "../../../codeCharta.model"
import { map, tap } from "rxjs"
import { getVisibleFiles, isPartialState } from "../../../model/files/files.helper"
import { visibleFileStatesSelector } from "../../selectors/visibleFileStates.selector"
import { getMergedEdges } from "./utils/edges.merger"
import { getMergedMarkedPackages } from "./utils/markedPackages.merger"
import { getMergedBlacklist } from "./utils/blacklist.merger"
import { getMergedAttributeTypes } from "./utils/attributeTypes.merger"
import { getMergedAttributeDescriptors } from "./utils/attributeDescriptors.merger"
import { State } from "@ngrx/store"
import { FileState } from "../../../../../app/codeCharta/model/files/files"

const FILES_LOCAL_STORAGE_VERSION = "1.0.0"
export const FILES_LOCAL_STORAGE_ELEMENT = "CodeCharta::files"

@Injectable()
export class UpdateFileSettingsEffect {
	constructor(private actions$: Actions, private state: State<CcState>) {}

	updateFileSettings$ = createEffect(() =>
		this.actions$.pipe(
			ofType(...fileActions),
			map(() => {
				const state = this.state.getValue()
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

	setFilesToLocalStorage$ = createEffect(
		() =>
			this.actions$.pipe(
				ofType(...fileActions),
				tap(async () => {
					const state: CcState = this.state.getValue()
					const files: FileState[] = state.files
					const compressedFiles = pako.deflate(stringify(files))
					const newLocalStorageElement: LocalStorageFiles = {
						version: FILES_LOCAL_STORAGE_VERSION,
						files: compressedFiles
					}
					localStorage.setItem(FILES_LOCAL_STORAGE_ELEMENT, stringify(newLocalStorageElement, stateObjectReplacer))
				})
			),
		{ dispatch: false }
	)
}
