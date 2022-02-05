import { Inject } from "@angular/core"
import { hierarchy } from "d3-hierarchy"
import { filter, map } from "rxjs"
import { CodeMapNode } from "../../../codeCharta.model"
import { createEffect } from "../../angular-redux/effects/createEffect"
import { Store } from "../../angular-redux/store"
import { unifiedMapNodeSelector } from "../../selectors/accumulatedData/unifiedMapNode.selector"
import { setIdToNode } from "../../store/lookUp/idToNode/idToNode.actions"

export class SetIdToNodeEffect {
	private unifiedMapNode$ = this.store.select(unifiedMapNodeSelector)

	constructor(@Inject(Store) private store: Store) {}

	setIdToNodeEffect$ = createEffect(() =>
		this.unifiedMapNode$.pipe(
			filter(unifiedMapNode => Boolean(unifiedMapNode)),
			map(unifiedMapNode => {
				const idToNode: Map<number, CodeMapNode> = new Map([[unifiedMapNode.id, unifiedMapNode]])
				for (const { data } of hierarchy(unifiedMapNode)) {
					idToNode.set(data.id, data)
				}
				return setIdToNode(idToNode)
			})
		)
	)
}
