import { combineLatest, map } from "rxjs"
import { visibleFileStatesSelector } from "../../../state/selectors/visibleFileStates.selector"
import { CustomConfigHelper } from "../../../util/customConfigHelper"
import { getDownloadableCustomConfigs } from "./getDownloadableCustomConfigs"
import { Inject, Injectable } from "@angular/core"
import { Store } from "../../../state/angular-redux/store"

@Injectable()
export class DownloadCustomConfigService {
	readonly downloadableCustomConfigs$ = combineLatest([
		this.store.select(visibleFileStatesSelector),
		CustomConfigHelper.customConfigChange$
	]).pipe(map(([visibleFileStates]) => getDownloadableCustomConfigs(visibleFileStates)))

	constructor(@Inject(Store) private store: Store) {}
}
