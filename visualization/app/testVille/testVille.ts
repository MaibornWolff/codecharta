import angular from "angular"
import { testVilleComponent } from "./testVille.component"
import "../codeCharta/state/state.module"
import "../codeCharta/ui/ui"

angular.module("app.testVille", ["app.codeCharta.state", "app.codeCharta.ui"]).component(testVilleComponent.selector, testVilleComponent)
