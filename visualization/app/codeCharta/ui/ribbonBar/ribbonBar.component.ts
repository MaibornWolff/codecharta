import "./ribbonBar.component.scss";
import $ from "jquery";
import {mouse} from "d3-selection";

export class RibbonBarController {

    /* @ngInject */
    constructor() {

        let open = false;
        $(document).on("mousemove",
            (e)=> {

                let mouseY = e.pageY;

                if (mouseY <= 50 && !open) {
                    open = true;
                    $("#header, .section-body").animate({
                        height: "+=250px"
                    }, 500);
                }

                if (mouseY > 300 && open) {
                    open = false;
                    $("#header, .section-body").animate({
                        height: "-=250px"
                    }, 500);
                }

            }
        );

        //$("#header").on("mouseleave",
        //    ()=>{
        //        $("#header, .section-body").animate({
        //            height: "-=250px"
        //        }, 500);
        //    }
        //);

    }

}

export const ribbonBarComponent = {
    selector: "ribbonBarComponent",
    template: require("./ribbonBar.component.html"),
    controller: RibbonBarController
};

