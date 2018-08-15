import "./ribbonBar.component.scss";
import $ from "jquery";

export class RibbonBarController {

    private heightExpanded = RibbonBarController.getExpandedHeight();
    private heightCollapsed = $("ribbon-bar-component #header").height();
    private collapsingElements = $("ribbon-bar-component #header, ribbon-bar-component .section-body");

    private isExpanded: boolean = false;

    /* @ngInject */
    constructor() {
        $(document).on("mousemove", this.onMouseMove.bind(this));
    }

    private onMouseMove(e) {
        if (e.pageY <= this.heightCollapsed && !this.isExpanded) {
            this.expand();
        } else if (e.pageY > this.heightExpanded && this.isExpanded) {
            this.collapse();
        }
    }

    public expand() {
        this.isExpanded = true;
        this.collapsingElements.addClass("expanded");
    }

    public collapse() {
        this.isExpanded = false;
        this.collapsingElements.removeClass("expanded");
    }

    private static getExpandedHeight() {
        const $inspector = $("<ribbon-bar-component><div id='header' class='expanded'></div></ribbon-bar-component>").css('display', 'none');
        $("body").append($inspector);
        try {
            return $inspector.find(".expanded").css("height").replace("px","");
        } finally {
            $inspector.remove();
        }
    }

}

export const ribbonBarComponent = {
    selector: "ribbonBarComponent",
    template: require("./ribbonBar.component.html"),
    controller: RibbonBarController
};

