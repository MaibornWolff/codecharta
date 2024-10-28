import { Component, OnInit } from "@angular/core"
import { Store } from "@ngrx/store"
import { Observable } from "rxjs"
import { CcState } from "../../../../codeCharta.model"

import { toggleSortingOrderAscending } from "../../../../state/store/appSettings/sortingOrderAscending/sortingOrderAscending.actions"
import { sortingOrderAscendingSelector } from "../../../../state/store/appSettings/sortingOrderAscending/sortingOrderAscending.selector"
import { AsyncPipe } from "@angular/common"

@Component({
    selector: "cc-sorting-button",
    templateUrl: "./sortingButton.component.html",
    styleUrls: ["./sortingButton.component.scss"],
    standalone: true,
    imports: [AsyncPipe]
})
export class SortingButtonComponent implements OnInit {
    sortingOrderAscending$: Observable<boolean>

    constructor(private store: Store<CcState>) {}

    ngOnInit(): void {
        this.sortingOrderAscending$ = this.store.select(sortingOrderAscendingSelector)
    }

    onClick() {
        this.store.dispatch(toggleSortingOrderAscending())
    }
}
