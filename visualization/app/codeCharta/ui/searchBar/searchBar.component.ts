import "./searchBar.component.scss"
import { BlacklistType, BlacklistItem } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { StoreService } from "../../state/store.service"
import { setSearchPattern } from "../../state/store/dynamicSettings/searchPattern/searchPattern.actions"
import debounce from "lodash.debounce"
import { BlacklistService, BlacklistSubscriber } from "../../state/store/fileSettings/blacklist/blacklist.service"
import { addBlacklistItem } from "../../state/store/fileSettings/blacklist/blacklist.actions"
import { SearchPatternService, SearchPatternSubscriber } from "../../state/store/dynamicSettings/searchPattern/searchPattern.service"

export class SearchBarController implements BlacklistSubscriber, SearchPatternSubscriber {
	private static DEBOUNCE_TIME = 400
	private readonly applyDebouncedSearchPattern: () => void

	private _viewModel: {
		searchPattern: string
		isPatternHidden: boolean
		isPatternExcluded: boolean
	} = {
		searchPattern: "",
		isPatternHidden: true,
		isPatternExcluded: true
	}

	/* @ngInject */
	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		BlacklistService.subscribe(this.$rootScope, this)
		SearchPatternService.subscribe(this.$rootScope, this)
		this.applyDebouncedSearchPattern = debounce(() => {
			this.updateSearchPattern()
		}, SearchBarController.DEBOUNCE_TIME)
	}

	onBlacklistChanged() {
		this.updateViewModel()
	}

	onSearchPatternChanged(searchPattern: string) {
		this._viewModel.searchPattern = searchPattern
		this.updateViewModel()
	}

	handleSearchPatternChange() {
		this.applyDebouncedSearchPattern()
	}

	onClickBlacklistPattern(blacklistType: BlacklistType) {
		const paths: string[] = this._viewModel.searchPattern.split(",")
		if (paths[0].startsWith("!")) {
			paths[0] = paths[0].slice(1)
			for (const path of paths) {
				if (path.length > 0) {
					this.storeService.dispatch(addBlacklistItem({ path: `!${this.unifyWildCard(path)}`, type: blacklistType }))
				}
			}
		} else {
			for (let path of paths) {
				if (path.length > 0) {
					if (path.startsWith("!")) {
						break
					} else {
						path = path = this.unifyWildCard(path)
					}
					this.storeService.dispatch(addBlacklistItem({path : path, type: blacklistType }))
				}
			}
		}
		this.resetSearchPattern()
	}

	isSearchPatternEmpty() {
		return (
			this._viewModel.searchPattern === "" ||
			this._viewModel.searchPattern === "!" ||
			this._viewModel.searchPattern === "*" ||
			this._viewModel.searchPattern === ","
		)
	}

	private updateViewModel() {
		const { blacklist } = this.storeService.getState().fileSettings
		this._viewModel.isPatternExcluded = this.isPatternBlacklisted(blacklist, BlacklistType.exclude)
		this._viewModel.isPatternHidden = this.isPatternBlacklisted(blacklist, BlacklistType.flatten)
	}

	private isPatternBlacklisted(blacklist: BlacklistItem[], blacklistType: BlacklistType) {
		const paths: string[] = this._viewModel.searchPattern.trim().split(",")
		let condition = false
		if (this._viewModel.searchPattern.trim().startsWith("!")) {
			paths[0] = paths[0].slice(1)
			for (const path of paths) {
				const pathNew = `!${this.unifyWildCard(path)}`
				condition = blacklist.some(x => pathNew === x.path && blacklistType === x.type)
				if (condition) {
					break
				}
			}
			return condition
		}
		for (const path of paths) {
			condition = blacklist.some(x => this.unifyWildCard(path) === x.path && blacklistType === x.type)
			if (condition) {
				break
			}
		}
		return condition
	}

	unifyWildCard(path: string): string {
		path = path.trim()
		if (path.startsWith("*") || path.endsWith("*")) {
			return path
		}
		if (path.startsWith("/") || path.startsWith("./")) {
			return path
		}
		if (!path.startsWith('"') && !path.endsWith('"')) {
			path = path.startsWith("!") ? path : `*${path}*`
			return path
		}
		return path
	}

	private resetSearchPattern() {
		this._viewModel.searchPattern = ""
		this.updateSearchPattern()
	}

	private updateSearchPattern() {
		this.storeService.dispatch(setSearchPattern(this._viewModel.searchPattern))
	}
}

export const searchBarComponent = {
	selector: "searchBarComponent",
	template: require("./searchBar.component.html"),
	controller: SearchBarController
}
