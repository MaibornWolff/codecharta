export class SpeedLimit {
    private fastest?: import("../model/Speed").Speed;

    constructor(private readonly maximum: number) {}

    accept(candidate: import("../model/Speed").Speed): boolean {
        if (candidate.getSpeed() > this.maximum) {
            return false;
        }
        this.fastest = candidate;
        return true;
    }

    getFastest(): number {
        return this.fastest?.getSpeed() ?? 0;
    }
}
