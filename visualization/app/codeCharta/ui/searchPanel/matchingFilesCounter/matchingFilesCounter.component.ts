import { Component, ViewEncapsulation } from "@angular/core"
import { Store } from "@ngrx/store"
import { Observable } from "rxjs"
import { CcState } from "../../../codeCharta.model"
import { MatchingFilesCounter, matchingFilesCounterSelector } from "./selectors/matchingFilesCounter.selector"

@Component({
    selector: "cc-matching-files-counter",
    templateUrl: "./matchingFilesCounter.component.html",
    styleUrls: ["./matchingFilesCounter.component.scss"],
    encapsulation: ViewEncapsulation.None
})
export class MatchingFilesCounterComponent {
    matchingFileCounters$: Observable<MatchingFilesCounter>

    constructor(store: Store<CcState>) {
        this.matchingFileCounters$ = store.select(matchingFilesCounterSelector)
    }
}
