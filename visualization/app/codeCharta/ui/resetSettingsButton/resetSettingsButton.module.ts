import "../../state/state.module"

import angular from "angular"

import { ResetSettingsButtonComponent } from "./resetSettingsButton.component"
import { downgradeComponent } from "@angular/upgrade/static"
import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"

angular
	.module("app.codeCharta.ui.resetSettingsButton", ["app.codeCharta.state"])
	.directive("ccResetSettingsButton", downgradeComponent({ component: ResetSettingsButtonComponent }))

@NgModule({
	imports: [CommonModule],
	declarations: [ResetSettingsButtonComponent],
	exports: [ResetSettingsButtonComponent],
	entryComponents: [ResetSettingsButtonComponent]
})
export class ResetSettingsButtonModule {}
