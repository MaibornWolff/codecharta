import angular from "angular"
import ngRedux from "ng-redux"

import { sortingButtonComponent } from "./sortingButton.component"

angular.module("app.codeCharta.ui.sortingButton", [ngRedux]).component(sortingButtonComponent.selector, sortingButtonComponent)
