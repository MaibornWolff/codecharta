import { BehaviorSubject, combineLatest } from "rxjs"
import { visibleFileStatesSelector } from "../../../state/selectors/visibleFileStates.selector"
import { CustomConfigHelper } from "../../../util/customConfigHelper"
import { DownloadableConfigs, getDownloadableCustomConfigs } from "./downloadableCustomConfigsHelper"
import { Inject, Injectable } from "@angular/core"
import { Store } from "../../../state/angular-redux/store"

@Injectable({ providedIn: "root" })
export class DownloadCustomConfigService {
	downloadableCustomConfigs$: BehaviorSubject<DownloadableConfigs> = new BehaviorSubject<DownloadableConfigs>(new Map())

	constructor(@Inject(Store) private store: Store) {
		combineLatest([this.store.select(visibleFileStatesSelector), CustomConfigHelper.customConfigChange$]).subscribe(
			([visibleFileStates]) => {
				this.downloadableCustomConfigs$.next(getDownloadableCustomConfigs(visibleFileStates))
			}
		)
	}

	get downloadableCustomConfig$() {
		return this.downloadableCustomConfigs$
	}
}
