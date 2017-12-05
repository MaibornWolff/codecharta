import {IDirective} from "angular";

/*
 * TODO find a better approach with shims or globals. At this moment $ is loaded in app.ts and after that decorated by materialize.
 */
declare function $(arg: any): any;

/**
 * Collapsible element. Should be put inside a {@link CollapsibleDirective}.
 */
export class CollapsibleElementDirective implements IDirective{

    restrict = "E";
     scope = {
        iconClass: "@iconClass",
        label:"@"
    };

    replace = true;
    transclude = true;
    template = "<li>\n" +
        "    <div class=\"collapsible-header\"><i class=\"fa {{::iconClass}}\"></i>{{::label}}</div>\n" +
        "    <div class=\"collapsible-body\">\n" +
        "        <div class=\"row\" ng-transclude>\n" +
        "          <!--transcluded content-->\n" +
        "        </div>\n" +
        "    </div>\n" +
        "</li>";

    constructor(private $rootScope, private $timeout) {}

    /**
     * calls the materialize function collapsible(...) on the collapsible element. This is needed to initialize the functionality.
     */
    link() {
        //needs to be done
        const ctx = this;
        ($("#settingsPanel .collapsible") as any).collapsible({
            accordion: false,
            onOpen: function() { ctx.$timeout(function () {
                //This forces to rerender all rzsliders in this collapsible element. rz sliders do not automatically recognize collapse events from materialize therefore this is nessecary.
                ctx.$rootScope.$broadcast("rzSliderForceRender");
            }); }
        });
    }

}