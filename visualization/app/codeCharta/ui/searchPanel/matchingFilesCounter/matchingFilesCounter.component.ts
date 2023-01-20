import { Component, Inject, ViewEncapsulation } from "@angular/core"
import { Observable } from "rxjs"
import { Store } from "../../../state/angular-redux/store"
import { MatchingFilesCounter, matchingFilesCounterSelector } from "./selectors/matchingFilesCounter.selector"

@Component({
	selector: "cc-matching-files-counter",
	templateUrl: "./matchingFilesCounter.component.html",
	styleUrls: ["./matchingFilesCounter.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class MatchingFilesCounterComponent {
	matchingFileCounters$: Observable<MatchingFilesCounter>

	constructor(@Inject(Store) store: Store) {
		this.matchingFileCounters$ = store.select(matchingFilesCounterSelector)
	}
}
