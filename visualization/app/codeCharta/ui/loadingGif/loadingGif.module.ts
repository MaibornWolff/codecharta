import "../../state/state.module"
import angular from "angular"
import { loadingGifComponent } from "./loadingGif.component"

angular.module("app.codeCharta.ui.loadingGif", ["app.codeCharta.state"])
    .component(loadingGifComponent.selector, loadingGifComponent)


