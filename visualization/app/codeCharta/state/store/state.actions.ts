import { CCAction, State } from "../../codeCharta.model"

export enum StateActions {
	SET_STATE = "SET_STATE"
}

export interface SetStateAction extends CCAction {
	type: StateActions.SET_STATE
	payload: State
}

export type StateAction = SetStateAction

export function setState(state: State): StateAction {
	return {
		type: StateActions.SET_STATE,
		payload: state
	}
}
