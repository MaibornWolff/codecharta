import "./artificialIntelligence.component.scss"
import { Component, Inject } from "@angular/core"
import { Store } from "../../../state/angular-redux/store"
import { debounceTime, identity, map } from "rxjs"
import { artificialIntelligenceSelector } from "./selectors/artificialIntelligence.selector"

@Component({
	selector: "cc-artificial-intelligence",
	template: require("./artificialIntelligence.component.html")
})
export class ArtificialIntelligenceComponent {
	data$ = this.store.select(identity).pipe(debounceTime(10), map(artificialIntelligenceSelector))

	constructor(@Inject(Store) private store: Store) {}
}
