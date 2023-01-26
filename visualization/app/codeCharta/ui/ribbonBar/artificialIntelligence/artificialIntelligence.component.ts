import { Component, ViewEncapsulation } from "@angular/core"
import { Store } from "../../../state/angular-redux/store"
import { debounceTime, identity, map } from "rxjs"
import { artificialIntelligenceSelector } from "./selectors/artificialIntelligence.selector"

@Component({
	selector: "cc-artificial-intelligence",
	templateUrl: "./artificialIntelligence.component.html",
	styleUrls: ["./artificialIntelligence.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class ArtificialIntelligenceComponent {
	data$ = this.store.select(identity).pipe(debounceTime(10), map(artificialIntelligenceSelector))

	constructor(private store: Store) {}
}
