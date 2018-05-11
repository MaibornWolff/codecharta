export class LayoutSwitcherController {

    private static TIMEOUT_IN_MS = 200;

    public viewModel = {
        selectedState: ""
    };

    private stateService;

    /* @ngInject */
    constructor($state, $timeout) {
        this.stateService = $state;
        $timeout(()=>{
            this.viewModel.selectedState = this.stateService.$current.name;
        }, LayoutSwitcherController.TIMEOUT_IN_MS);
    }

    onLayoutChange(state: string) {
        this.stateService.go(state);
    }

}

export const layoutSwitcherComponent = {
    selector: "layoutSwitcherComponent",
    template: require("./layoutSwitcher.component.html"),
    controller: LayoutSwitcherController
};




