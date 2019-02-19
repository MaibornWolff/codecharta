export class LayoutSwitcherController {

    private static TIMEOUT_IN_MS = 200;

    public viewModel = {
        states: [],
        selectedState: ""
    };

    private layouts = "";

    private stateService;

    /* @ngInject */
    constructor($state, $timeout) {
        this.stateService = $state;

        $timeout(()=>{

            this.viewModel.selectedState = this.stateService.$current.name;

            this.viewModel.states = this.layouts
                .replace(/ /g,"")
                .replace(/\n/g,"")
                .split(",");

        }, LayoutSwitcherController.TIMEOUT_IN_MS);

    }

    public onLayoutChange(state: string) {
        this.stateService.go(state);
    }

}

export const layoutSwitcherComponent = {
    selector: "layoutSwitcherComponent",
    template: require("./layoutSwitcher.component.html"),
    controller: LayoutSwitcherController,
    bindings: {
        layouts: "@"
    }
};




