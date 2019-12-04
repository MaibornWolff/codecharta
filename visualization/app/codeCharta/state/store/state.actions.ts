import { CCAction, RecursivePartial, State } from "../../codeCharta.model"

export enum StateActions {
	SET_STATE = "SET_STATE"
}

export interface SetStateAction extends CCAction {
	type: StateActions.SET_STATE
	payload: RecursivePartial<State>
}

export type StateAction = SetStateAction

export function setState(state: RecursivePartial<State>): StateAction {
	return {
		type: StateActions.SET_STATE,
		payload: state
	}
}
