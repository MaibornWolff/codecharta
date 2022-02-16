import { Component, Inject } from "@angular/core"
import { Observable } from "rxjs"
import { Store } from "../../state/angular-redux/store"
import "./matchingFilesCounter.component.scss"
import { MatchingFilesCounter, matchingFilesCounterSelector } from "./selectors/matchingFilesCounter.selector"

@Component({
	selector: "cc-matching-files-counter",
	template: require("./matchingFilesCounter.component.html")
})
export class MatchingFilesCounterComponent {
	matchingFileCounters$: Observable<MatchingFilesCounter>

	constructor(@Inject(Store) store: Store) {
		this.matchingFileCounters$ = store.select(matchingFilesCounterSelector)
	}
}
