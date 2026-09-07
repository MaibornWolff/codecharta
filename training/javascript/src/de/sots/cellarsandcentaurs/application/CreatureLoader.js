export class CreatureLoader {
    async loadCentaur(id) {
        const { Centaur } = await import("../domain/model/Centaur.js");
        return new Centaur(id);
    }

    async loadHitPoints(max) {
        const hitPointsModuleUrl = new URL("../domain/model/HitPoints.js", import.meta.url);
        const { HitPoints } = await import(hitPointsModuleUrl.href);
        return HitPoints.init(max);
    }
}
