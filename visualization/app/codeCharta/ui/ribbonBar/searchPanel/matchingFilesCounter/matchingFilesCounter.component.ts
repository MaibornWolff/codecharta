import { Component } from "@angular/core"
import { Store } from "@ngrx/store"
import { Observable } from "rxjs"
import { CcState } from "../../../../codeCharta.model"
import { MatchingFilesCounter, matchingFilesCounterSelector } from "./selectors/matchingFilesCounter.selector"
import { ThumbTackButtonComponent } from "../thumbTackButton/thumbTackButton.component"
import { SortingButtonComponent } from "../sortingButton/sortingButton.component"
import { SortingOptionComponent } from "../sortingOption/sortingOption.component"
import { AsyncPipe } from "@angular/common"

@Component({
    selector: "cc-matching-files-counter",
    templateUrl: "./matchingFilesCounter.component.html",
    styleUrls: ["./matchingFilesCounter.component.scss"],
    standalone: true,
    imports: [ThumbTackButtonComponent, SortingButtonComponent, SortingOptionComponent, AsyncPipe]
})
export class MatchingFilesCounterComponent {
    matchingFileCounters$: Observable<MatchingFilesCounter>

    constructor(store: Store<CcState>) {
        this.matchingFileCounters$ = store.select(matchingFilesCounterSelector)
    }
}
