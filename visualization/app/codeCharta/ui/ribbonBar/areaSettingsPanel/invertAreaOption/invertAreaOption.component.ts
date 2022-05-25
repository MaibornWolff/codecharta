import "./invertAreaOption.component.scss"
import { Component, Inject, OnInit } from "@angular/core"
import { Store } from "../../../../state/angular-redux/store"
import { invertAreaSelector } from "../../../../state/store/appSettings/invertArea/invertArea.selector"
import { toggleInvertingArea } from "../../../../state/store/appSettings/invertArea/invertArea.actions"
import { Observable } from "rxjs"

@Component({
	selector: "cc-invert-area-option",
	template: require("./invertAreaOption.component.html")
})
export class InvertAreaOptionComponent implements OnInit {
	isInvertedArea$: Observable<boolean>

	constructor(@Inject(Store) private store: Store) {}

	ngOnInit(): void {
		this.isInvertedArea$ = this.store.select(invertAreaSelector)
	}

	toggleInvertingArea() {
		this.store.dispatch(toggleInvertingArea())
	}
}
