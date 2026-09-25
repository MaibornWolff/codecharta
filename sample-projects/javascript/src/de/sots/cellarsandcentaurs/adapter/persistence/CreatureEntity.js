export class CreatureEntity {
    XPValue = 0;

    constructor(id, XPValue = 0) {
        this.id = id ?? "ididid";
        this.XPValue = XPValue;
    }
}
