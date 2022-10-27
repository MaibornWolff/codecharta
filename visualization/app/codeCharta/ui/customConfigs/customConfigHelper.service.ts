import { combineLatest, map } from "rxjs"
import { visibleFileStatesSelector } from "../../state/selectors/visibleFileStates.selector"
import { CustomConfigHelper } from "../../util/customConfigHelper"
import { getDownloadableCustomConfigs } from "./downloadCustomConfigsButton/getDownloadableCustomConfigs"
import { Inject, Injectable } from "@angular/core"
import { Store } from "../../state/angular-redux/store"
import { getCustomConfigItemGroups } from "./customConfigList/getCustomConfigItemGroups"
import { visibleFilesBySelectionModeSelector } from "./customConfigList/visibleFilesBySelectionMode.selector"

@Injectable()
export class CustomConfigHelperService {
	readonly downloadableCustomConfigs$ = combineLatest([
		this.store.select(visibleFileStatesSelector),
		CustomConfigHelper.customConfigChange$
	]).pipe(map(([visibleFileStates]) => getDownloadableCustomConfigs(visibleFileStates)))

	readonly customConfigItemGroups$ = combineLatest([
		this.store.select(visibleFilesBySelectionModeSelector),
		CustomConfigHelper.customConfigChange$
	]).pipe(map(([visibleFilesBySelectionMode]) => getCustomConfigItemGroups(visibleFilesBySelectionMode)))

	constructor(@Inject(Store) private store: Store) {}
}
