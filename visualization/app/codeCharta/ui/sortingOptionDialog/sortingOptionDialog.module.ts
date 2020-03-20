import "../../state/state.module"
import angular from "angular"
import { sortingOptionDialogComponent } from "./sortingOptionDialog.component"

angular
	.module("app.codeCharta.ui.sortingOptionDialog", ["app.codeCharta.state"])
	.component(sortingOptionDialogComponent.selector, sortingOptionDialogComponent)
