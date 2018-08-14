import "./ribbonBar.component.scss";
import $ from "jquery";

export class RibbonBarController {

    /* @ngInject */
    constructor() {

        $("#header").on("mouseenter",
            ()=>{
                $("#header, .section-body").animate({
                    height: "+=250px"
                }, 500);
            }
        );

        $("#header").on("mouseleave",
            ()=>{
                $("#header, .section-body").animate({
                    height: "-=250px"
                }, 500);
            }
        );

    }

}

export const ribbonBarComponent = {
    selector: "ribbonBarComponent",
    template: require("./ribbonBar.component.html"),
    controller: RibbonBarController
};

