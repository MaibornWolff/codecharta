import { MarkedPackagesAction, setMarkedPackages } from "./markedPackages.actions"
import { MarkedPackage } from "../../../../model/codeCharta.model"

export function splitMarkedPackagesAction(payload: MarkedPackage[]): MarkedPackagesAction {
	return setMarkedPackages(payload)
}
