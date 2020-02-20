import { MarkedPackagesAction, setMarkedPackages } from "./markedPackages.actions"
import { MarkedPackage } from "../../../../codeCharta.model"

export function splitMarkedPackagesAction(payload: MarkedPackage[]): MarkedPackagesAction {
	return setMarkedPackages(payload)
}
