import $ from "jquery";

/**
 * Renders a simple floating action button.
 */
export const fabComponent = {
    selector: "fabComponent",
    template: "<a class='btn-floating btn-large waves-effect waves-light teal'><i class='fa {{::$ctrl.iconClass}}'></i></a>",
    bindings: {
        iconClass: "@"
    }
};


