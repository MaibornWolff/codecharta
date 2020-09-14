import { setMarkedPackages } from "./markedPackages.actions"
import { MarkedPackage } from "../../../../codeCharta.model"

export function splitMarkedPackagesAction(payload: MarkedPackage[]) {
	return setMarkedPackages(payload)
}
