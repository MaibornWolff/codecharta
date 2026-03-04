import { Injectable } from "@angular/core"
import { GroupLabelCollisionsStore } from "../stores/groupLabelCollisions.store"

@Injectable({
    providedIn: "root"
})
export class GroupLabelCollisionsService {
    constructor(private readonly groupLabelCollisionsStore: GroupLabelCollisionsStore) {}

    groupLabelCollisions$() {
        return this.groupLabelCollisionsStore.groupLabelCollisions$
    }

    setGroupLabelCollisions(value: boolean) {
        this.groupLabelCollisionsStore.setGroupLabelCollisions(value)
    }
}
