import { TestBed } from "@angular/core/testing"
import { Subject } from "rxjs"
import { Action, State } from "@ngrx/store"
import { EffectsModule } from "@ngrx/effects"
import { provideMockActions } from "@ngrx/effects/testing"
import { provideMockStore, MockStore } from "@ngrx/store/testing"

import { setFiles } from "../../store/files/files.actions"
import { setState } from "../../store/state.actions"
import { UpdateFileSettingsEffect } from "./updateFileSettings.effect"
import { getLastAction } from "../../../util/testUtils/store.utils"

describe("UpdateFileSettingsEffect", () => {
	let actions$: Subject<Action>

	beforeEach(async () => {
		actions$ = new Subject()
		TestBed.configureTestingModule({
			imports: [EffectsModule.forRoot([UpdateFileSettingsEffect])],
			providers: [
				{ provide: State, useValue: { getValue: () => ({ files: [] }) } },
				provideMockStore(),
				provideMockActions(() => actions$)
			]
		})
	})

	afterEach(() => {
		actions$.complete()
	})

	it("should update fileSettings when files have changed", async () => {
		const store = TestBed.inject(MockStore)
		actions$.next(setFiles({ value: [] }))
		expect(await getLastAction(store)).toEqual(
			setState({
				value: {
					fileSettings: {
						edges: [],
						markedPackages: [],
						blacklist: [],
						attributeTypes: { edges: {}, nodes: {} },
						attributeDescriptors: {}
					}
				}
			})
		)
	})
})
