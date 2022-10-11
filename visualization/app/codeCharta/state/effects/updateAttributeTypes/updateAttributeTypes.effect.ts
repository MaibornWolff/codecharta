import { Inject, Injectable } from "@angular/core"
import { Store } from "../../angular-redux/store"
import { createEffect } from "../../angular-redux/effects/createEffect"
import { map } from "rxjs"
import { visibleFileStatesSelector } from "../../selectors/visibleFileStates.selector"
import { getMergedAttributeTypes } from "./attributeTypes.merger"
import { setAttributeTypes } from "../../store/fileSettings/attributeTypes/attributeTypes.actions"

@Injectable()
export class UpdateAttributeTypesEffect {
	constructor(@Inject(Store) private store: Store) {}

	updateAttributeTypes$ = createEffect(() =>
		this.store.select(visibleFileStatesSelector).pipe(
			map(visibleFiles => {
				const allAttributeTypes = visibleFiles.map(({ file }) => file.settings.fileSettings.attributeTypes)
				const mergedAttributeTypes = getMergedAttributeTypes(allAttributeTypes)
				return setAttributeTypes(mergedAttributeTypes)
			})
		)
	)
}
