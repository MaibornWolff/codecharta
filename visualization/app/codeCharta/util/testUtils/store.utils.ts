import { MockStore } from "@ngrx/store/testing"
import { firstValueFrom } from "rxjs"
import { filter } from "rxjs/operators"

export async function getLastAction(store: MockStore) {
    return firstValueFrom(store.scannedActions$.pipe(
        filter(action => action.type !== '@ngrx/effects/init')
    ))
}
