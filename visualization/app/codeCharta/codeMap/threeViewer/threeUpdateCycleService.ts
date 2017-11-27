/**
 * This service allows other parts of the application to hook into the update cycle and get called on each cycle.
 */
export class ThreeUpdateCycleService {

    public static SELECTOR = "threeUpdateCycleService";

    private updatables: Function[] = [];

    constructor() {
    }

    register(onUpdate: Function) {
        this.updatables.push(onUpdate);
    }

    /**
     * Updates all registered callback functions
     */
    update() {
        this.updatables.forEach((u: Function)=> {
            u();
        });
    }

}


