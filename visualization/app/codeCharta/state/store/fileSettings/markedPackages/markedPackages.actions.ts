import { CCAction, MarkedPackage } from "../../../../codeCharta.model"

export enum MarkedPackagesActions {
	SET_MARKED_PACKAGES = "SET_MARKED_PACKAGES",
	MARK_PACKAGE = "MARK_PACKAGE",
	UNMARK_PACKAGE = "UNMARK_PACKAGE"
}

export interface SetMarkedPackagesAction extends CCAction {
	type: MarkedPackagesActions.SET_MARKED_PACKAGES
	payload: MarkedPackage[]
}

export interface MarkPackageAction extends CCAction {
	type: MarkedPackagesActions.MARK_PACKAGE
	payload: MarkedPackage
}

export interface UnmarkPackageAction extends CCAction {
	type: MarkedPackagesActions.UNMARK_PACKAGE
	payload: MarkedPackage
}

export type MarkedPackagesAction = SetMarkedPackagesAction | MarkPackageAction | UnmarkPackageAction

export function setMarkedPackages(markedPackages: MarkedPackage[] = defaultMarkedPackages): SetMarkedPackagesAction {
	return {
		type: MarkedPackagesActions.SET_MARKED_PACKAGES,
		payload: markedPackages
	}
}

export function markPackage(markedPackage: MarkedPackage): MarkPackageAction {
	return {
		type: MarkedPackagesActions.MARK_PACKAGE,
		payload: markedPackage
	}
}

export function unmarkPackage(markedPackage: MarkedPackage): UnmarkPackageAction {
	return {
		type: MarkedPackagesActions.UNMARK_PACKAGE,
		payload: markedPackage
	}
}

export const defaultMarkedPackages: MarkedPackage[] = []
