import util = require("./CreatureUtil");
import { Stable } from "../domain/model/Stable";
import { CreatureId } from "../domain/model/CreatureId";

export class CreatureLoader {
    private readonly groom = new Stable.Groom("cellar");

    async loadCentaur(id: CreatureId): Promise<number> {
        const { Centaur } = await import("../domain/model/Centaur");
        const centaur = new Centaur(id);
        this.groom.brush(centaur.getId().id);
        return util.CreatureUtil.countHoard(centaur);
    }
}
