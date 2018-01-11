import {IDirective} from "angular";

/**
 * Container for {CollapsibleElementDirective}. Inner elements do not replace this. They are put inside the ng-transclude tag.
 */
export class CollapsibleDirective implements IDirective{

    restrict = "E";
    scope = {};
    replace = true;
    transclude = true;
    template = "<ul class='collapsible' data-collapsible='accordion' ng-transclude></ul>";

    constructor() {}

}
