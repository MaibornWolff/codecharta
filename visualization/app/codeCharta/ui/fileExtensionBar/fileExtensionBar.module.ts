import "../../state/state.module"
import "../../ui/ui"
import angular from "angular"
import { fileExtensionBarComponent } from "./fileExtensionBar.component"
import { downgradeComponent } from "@angular/upgrade/static"
import { DistributionMetricChooserComponent } from "./distributionMetricChooser/distributionMetricChooser.component"

angular
	.module("app.codeCharta.ui.fileExtensionBar", ["app.codeCharta.state", "app.codeCharta.ui.codeMap"])
	.component(fileExtensionBarComponent.selector, fileExtensionBarComponent)
	.directive("ccDistributionMetricChooser", downgradeComponent({ component: DistributionMetricChooserComponent }))
