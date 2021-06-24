import angular from "angular"
import "angular-animate"
import "angular-aria"
import "angular-material"
import "angular-sanitize"
import ngRedux from "ng-redux"

import "./codeCharta/codeCharta.module"
import "./app.scss"
import { Store } from "./codeCharta/state/store/store"

angular
	.module("app", [ngRedux, "app.codeCharta", "ngMaterial", "ngSanitize"])
	.config([
		"$ngReduxProvider",
		$ngReduxProvider => {
			$ngReduxProvider.provideStore(Store.store)
		}
	])
	.config([
		"$locationProvider",
		$locationProvider => {
			$locationProvider.hashPrefix("")
			$locationProvider.html5Mode({
				enabled: true,
				requireBase: false
			})
		}
	])
	.config([
		"$mdThemingProvider",
		$mdThemingProvider => {
			$mdThemingProvider.theme("default").primaryPalette("teal").warnPalette("teal").accentPalette("teal")
		}
	])
	.config([
		"$mdAriaProvider",
		$mdAriaProvider => {
			$mdAriaProvider.disableWarnings()
		}
	])
	.config([
		"$compileProvider",
		$compileProvider => {
			$compileProvider.imgSrcSanitizationWhitelist(/^\s*((https?|ftp|file|blob|chrome-extension):|data:image\/)/)
			$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|chrome-extension):/)
		}
	])

angular.bootstrap(document.body, ["app"], { strictDi: true })
