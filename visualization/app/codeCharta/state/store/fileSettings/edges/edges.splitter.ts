import { setEdges } from "./edges.actions"
import { Edge } from "../../../../codeCharta.model"

export function splitEdgesAction(payload: Edge[]) {
	return setEdges(payload)
}
