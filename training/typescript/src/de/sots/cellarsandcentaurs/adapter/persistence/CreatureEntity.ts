import { Persistent } from "./decorators";
import { CreatureTable } from "./CreatureTable";

@Persistent(CreatureTable)
export class CreatureEntity {
    id: string;
    XPValue = 0;

    constructor(id?: string) {
        this.id = id ?? "ididid";
    }
}
