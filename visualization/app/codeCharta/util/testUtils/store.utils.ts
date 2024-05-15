import { MockStore } from "@ngrx/store/testing"
import { firstValueFrom } from "rxjs"

export async function getLastAction(store: MockStore) {
    return firstValueFrom(store.scannedActions$)
}
