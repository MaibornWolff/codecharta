import { getService } from "../../../mocks/ng.mockhelper"
import { StoreService } from "../state/store.service"
import { Store } from "../state/store/store"

export const getStoreService = () => {
	const storeService = getService<StoreService>("storeService")
	storeService["store"] = Store["initStore"]()
	return storeService
}
