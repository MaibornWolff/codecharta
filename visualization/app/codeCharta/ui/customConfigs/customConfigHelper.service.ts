import { combineLatest, map } from "rxjs"
import { CustomConfigHelper } from "../../util/customConfigHelper"
import { getDownloadableCustomConfigs } from "./downloadCustomConfigsButton/getDownloadableCustomConfigs"
import { Injectable } from "@angular/core"
import { Store } from "../../state/angular-redux/store"
import { getCustomConfigItemGroups } from "./customConfigList/getCustomConfigItemGroups"
import { visibleFilesBySelectionModeSelector } from "./visibleFilesBySelectionMode.selector"

@Injectable()
export class CustomConfigHelperService {
	readonly downloadableCustomConfigs$ = combineLatest([
		this.store.select(visibleFilesBySelectionModeSelector),
		CustomConfigHelper.customConfigChange$
	]).pipe(map(([visibleFilesBySelectionMode]) => getDownloadableCustomConfigs(visibleFilesBySelectionMode)))

	readonly customConfigItemGroups$ = combineLatest([
		this.store.select(visibleFilesBySelectionModeSelector),
		CustomConfigHelper.customConfigChange$
	]).pipe(map(([visibleFilesBySelectionMode]) => getCustomConfigItemGroups(visibleFilesBySelectionMode)))

	constructor(private store: Store) {}
}
