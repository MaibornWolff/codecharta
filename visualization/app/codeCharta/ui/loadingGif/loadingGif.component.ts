import "./loadingGif.component.scss"

export class LoadingGifController {

    /* @ngInject */
    constructor(){

    }

}

export const loadingGifComponent = {
    selector: "loadingGifComponent",
    template: require("./loadingGif.component.html"),
    controller: LoadingGifController
}