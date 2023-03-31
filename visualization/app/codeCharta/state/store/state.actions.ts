import { Action, createAction, props } from "@ngrx/store"
import { RecursivePartial, State } from "../../codeCharta.model"

export const setState = createAction("SET_STATE", props<{ value: RecursivePartial<State> }>())

export function isSetStateAction(action: Action): action is ReturnType<typeof setState> {
	return action.type === setState.type
}
