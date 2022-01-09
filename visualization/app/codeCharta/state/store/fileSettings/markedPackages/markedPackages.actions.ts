import { CCAction, CodeMapNode, MarkedPackage } from "../../../../codeCharta.model"

export enum MarkedPackagesActions {
	SET_MARKED_PACKAGES = "SET_MARKED_PACKAGES",
	MARK_PACKAGE = "MARK_PACKAGE",
	UNMARK_PACKAGE = "UNMARK_PACKAGE"
}

export interface MarkPackagesAction extends CCAction {
	type: MarkedPackagesActions.MARK_PACKAGE
	payload: MarkedPackage[]
}

export interface SetMarkedPackagesAction extends CCAction {
	type: MarkedPackagesActions.SET_MARKED_PACKAGES
	payload: MarkedPackage[]
}

export interface UnmarkPackageAction extends CCAction {
	type: MarkedPackagesActions.UNMARK_PACKAGE
	payload: CodeMapNode["path"]
}

export type MarkedPackagesAction = SetMarkedPackagesAction | UnmarkPackageAction | MarkPackagesAction

export function markPackages(packagesToBeMarked: MarkedPackage[]): MarkPackagesAction {
	return {
		type: MarkedPackagesActions.MARK_PACKAGE,
		payload: packagesToBeMarked
	}
}

export function setMarkedPackages(markedPackages: MarkedPackage[] = defaultMarkedPackages): SetMarkedPackagesAction {
	return {
		type: MarkedPackagesActions.SET_MARKED_PACKAGES,
		payload: markedPackages
	}
}

export function unmarkPackage(node: Pick<CodeMapNode, "path">): UnmarkPackageAction {
	return {
		type: MarkedPackagesActions.UNMARK_PACKAGE,
		payload: node.path
	}
}

export const defaultMarkedPackages: MarkedPackage[] = []
