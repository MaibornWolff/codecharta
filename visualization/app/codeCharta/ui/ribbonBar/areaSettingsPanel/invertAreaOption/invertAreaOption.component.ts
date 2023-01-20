import { Component, Inject, OnInit, ViewEncapsulation } from "@angular/core"
import { Store } from "../../../../state/angular-redux/store"
import { invertAreaSelector } from "../../../../state/store/appSettings/invertArea/invertArea.selector"
import { toggleInvertingArea } from "../../../../state/store/appSettings/invertArea/invertArea.actions"
import { Observable } from "rxjs"

@Component({
	selector: "cc-invert-area-option",
	templateUrl: "./invertAreaOption.component.html",
	encapsulation: ViewEncapsulation.None
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
