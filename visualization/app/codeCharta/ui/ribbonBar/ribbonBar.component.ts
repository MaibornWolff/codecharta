import "./ribbonBar.component.scss";
import $ from "jquery";

export class RibbonBarController {

    private collapsingElements = $("ribbon-bar-component #header, ribbon-bar-component .section-body, #toggle-ribbon-bar-fab");

    private isExpanded: boolean = false;

    private toggle(e) {
        if (!this.isExpanded) {
            this.expand();
        } else {
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

}

export const ribbonBarComponent = {
    selector: "ribbonBarComponent",
    template: require("./ribbonBar.component.html"),
    controller: RibbonBarController
};

