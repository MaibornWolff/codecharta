import { EdgesAction, setEdges } from "./edges.actions"
import { Edge } from "../../../../codeCharta.model"

export function splitEdgesAction(payload: Edge[]): EdgesAction {
	return setEdges(payload)
}
