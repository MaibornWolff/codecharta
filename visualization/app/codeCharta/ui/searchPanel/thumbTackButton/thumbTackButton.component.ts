import { Component, OnInit, ViewEncapsulation } from "@angular/core"
import { Store } from "@ngrx/store"
import { Observable } from "rxjs"
import { CcState } from "../../../codeCharta.model"

import { toggleIsFileExplorerPinned } from "../../../state/store/appSettings/isFileExplorerPinned/isFileExplorerPinned.actions"
import { isFileExplorerPinnedSelector } from "../../../state/store/appSettings/isFileExplorerPinned/isFileExplorerPinned.selector"

@Component({
	selector: "cc-thumb-tack-button",
	templateUrl: "./thumbTackButton.component.html",
	styleUrls: ["./thumbTackButton.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class ThumbTackButtonComponent implements OnInit {
	isFileExplorerPinned$: Observable<boolean>

	constructor(private store: Store<CcState>) {}

	ngOnInit(): void {
		this.isFileExplorerPinned$ = this.store.select(isFileExplorerPinnedSelector)
	}

	onClick() {
		this.store.dispatch(toggleIsFileExplorerPinned())
	}
}
