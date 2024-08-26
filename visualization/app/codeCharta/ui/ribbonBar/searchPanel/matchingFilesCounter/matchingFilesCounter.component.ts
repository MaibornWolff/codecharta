import { Component, EventEmitter, Output, ViewEncapsulation } from "@angular/core"
import { Store } from "@ngrx/store"
import { Observable } from "rxjs"
import { CcState } from "../../../../codeCharta.model"
import { MatchingFilesCounter, matchingFilesCounterSelector } from "./selectors/matchingFilesCounter.selector"

@Component({
    selector: "cc-matching-files-counter",
    templateUrl: "./matchingFilesCounter.component.html",
    styleUrls: ["./matchingFilesCounter.component.scss"],
    encapsulation: ViewEncapsulation.None
})
export class MatchingFilesCounterComponent {
    @Output() pinClick: EventEmitter<void> = new EventEmitter<void>();

    matchingFileCounters$: Observable<MatchingFilesCounter>

    constructor(store: Store<CcState>) {
        this.matchingFileCounters$ = store.select(matchingFilesCounterSelector)
    }

    onPinClick() {
        this.pinClick.emit();
    }
}
