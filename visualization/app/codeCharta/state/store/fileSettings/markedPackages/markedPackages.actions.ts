import { CCAction, MarkedPackage } from "../../../../codeCharta.model"

export enum MarkedPackagesActions {
	SET_MARKED_PACKAGES = "SET_MARKED_PACKAGES",
	CALCULATE_MARKED_PACKAGES_FOR_PATHS = "CALCULATE_MARKED_PACKAGES",
	MARK_PACKAGE = "MARK_PACKAGE",
	UNMARK_PACKAGE = "UNMARK_PACKAGE"
}

export interface CalculateMarkedPackagesAction extends CCAction {
	type: MarkedPackagesActions.CALCULATE_MARKED_PACKAGES_FOR_PATHS
	payload: MarkedPackage[]
}

export interface SetMarkedPackagesAction extends CCAction {
	type: MarkedPackagesActions.SET_MARKED_PACKAGES
	payload: MarkedPackage[]
}

export interface UnmarkPackageAction extends CCAction {
	type: MarkedPackagesActions.UNMARK_PACKAGE
	payload: number
}

export type MarkedPackagesAction = SetMarkedPackagesAction | UnmarkPackageAction | CalculateMarkedPackagesAction

export function calculateMarkedPackages(packagesToBeMarked: MarkedPackage[]): CalculateMarkedPackagesAction {
	return {
		type: MarkedPackagesActions.CALCULATE_MARKED_PACKAGES_FOR_PATHS,
		payload: packagesToBeMarked
	}
}

export function setMarkedPackages(markedPackages: MarkedPackage[] = defaultMarkedPackages): SetMarkedPackagesAction {
	return {
		type: MarkedPackagesActions.SET_MARKED_PACKAGES,
		payload: markedPackages
	}
}

export function unmarkPackage(index: number): UnmarkPackageAction {
	return {
		type: MarkedPackagesActions.UNMARK_PACKAGE,
		payload: index
	}
}

export const defaultMarkedPackages: MarkedPackage[] = []
