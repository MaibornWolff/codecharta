import { Component, ViewEncapsulation } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { artificialIntelligenceSelector } from "./selectors/artificialIntelligence.selector"

@Component({
	selector: "cc-artificial-intelligence",
	templateUrl: "./artificialIntelligence.component.html",
	styleUrls: ["./artificialIntelligence.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class ArtificialIntelligenceComponent {
	data$ = this.store.select(artificialIntelligenceSelector)

	constructor(private store: Store<CcState>) {}
}
