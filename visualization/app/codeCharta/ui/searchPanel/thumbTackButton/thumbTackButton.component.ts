import { Component, OnInit, ViewEncapsulation } from "@angular/core"
import { Store } from "@ngrx/store"
import { Observable } from "rxjs"
import { CcState } from "../../../codeCharta.model"

import { toggleIsSearchPanelPinned } from "../../../state/store/appSettings/isSearchPanelPinned/isSearchPanelPinned.actions"
import { isSearchPanelPinnedSelector } from "../../../state/store/appSettings/isSearchPanelPinned/isSearchPanelPinned.selector"

@Component({
    selector: "cc-thumb-tack-button",
    templateUrl: "./thumbTackButton.component.html",
    styleUrls: ["./thumbTackButton.component.scss"],
    encapsulation: ViewEncapsulation.None
})
export class ThumbTackButtonComponent implements OnInit {
    isSearchPanelPinned$: Observable<boolean>

    constructor(private store: Store<CcState>) {}

    ngOnInit(): void {
        this.isSearchPanelPinned$ = this.store.select(isSearchPanelPinnedSelector)
    }

    onClick() {
        this.store.dispatch(toggleIsSearchPanelPinned())
    }
}
