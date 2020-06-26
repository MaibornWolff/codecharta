import angular from "angular"
import "angular-animate"
import "angular-aria"
import "angular-material"
import "./codeCharta/codeCharta.module"
import "./assets/icon.ico"
import "angular-sanitize"
import "./app.scss"

angular.module("app", ["app.codeCharta", "ngMaterial", "ngSanitize"])

angular
	.module("app")
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
	.config($mdThemingProvider => {
		$mdThemingProvider.theme("default").primaryPalette("teal").warnPalette("teal").accentPalette("teal")
	})
	.config($mdAriaProvider => {
		$mdAriaProvider.disableWarnings()
	})
	.config([
		"$compileProvider",
		$compileProvider => {
			$compileProvider.imgSrcSanitizationWhitelist(/^\s*((https?|ftp|file|blob|chrome-extension):|data:image\/)/)
			$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|chrome-extension):/)
		}
	])
