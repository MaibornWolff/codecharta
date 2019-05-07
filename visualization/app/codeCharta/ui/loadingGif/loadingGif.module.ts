import "../../state/state.module"
import angular from "angular"
import { loadingGifFileComponent, loadingGifMapComponent } from "./loadingGif.component"
import { LoadingGifService } from "./loadingGif.service"

angular.module("app.codeCharta.ui.loadingGif",
	["app.codeCharta.state"]
).component(
	loadingGifFileComponent.selector,
	loadingGifFileComponent
).component(
	loadingGifMapComponent.selector,
	loadingGifMapComponent
).service(LoadingGifService.SELECTOR, LoadingGifService)


