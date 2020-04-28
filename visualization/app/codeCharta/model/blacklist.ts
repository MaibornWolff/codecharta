import { BlacklistItem, BlacklistType } from "../codeCharta.model"
import { addItemToArray, removeItemFromArray } from "../util/reduxHelper"
import ignore from "ignore"
import { CodeMapHelper } from "../util/codeMapHelper"
import _ from "lodash"

export class Blacklist {
	private blacklist: BlacklistItem[] = []

	constructor(blacklist: BlacklistItem[] = []) {
		this.setBlacklist(blacklist)
	}

	public setBlacklist(blacklist: BlacklistItem[]) {
		// TODO revisit clone
		this.blacklist = _.cloneDeep(blacklist)
	}

	public isPathBlacklisted(path: string, type: BlacklistType): boolean {
		if (this.blacklist.length === 0) {
			return false
		}

		const ig = ignore().add(this.blacklist.filter(b => b.type === type).map(ex => CodeMapHelper.transformPath(ex.path)))
		return ig.ignores(CodeMapHelper.transformPath(path))
	}

	public isPathExcluded(path: string): boolean {
		return this.isPathBlacklisted(path, BlacklistType.exclude)
	}

	public isPathFlattened(path: string): boolean {
		return this.isPathBlacklisted(path, BlacklistType.flatten)
	}

	public isPathFlattenedOrExcluded(path: string): boolean {
		return this.isPathExcluded(path) || this.isPathFlattened(path)
	}

	public getItems(): BlacklistItem[] {
		return this.blacklist
	}

	public getItemsByType(type: BlacklistType): BlacklistItem[] {
		return this.blacklist.filter(x => x.type === type)
	}

	public getExcludedItems(): BlacklistItem[] {
		return this.getItemsByType(BlacklistType.exclude)
	}

	public getFlattenedItems(): BlacklistItem[] {
		return this.getItemsByType(BlacklistType.flatten)
	}

	public size(): number {
		return this.blacklist.length
	}

	public sizeByType(type: BlacklistType): number {
		return this.getItemsByType(type).length
	}

	public has(path: string, type: BlacklistType): boolean {
		return this.blacklist.some(x => {
			return x.path === path && x.type === type
		})
	}

	public addBlacklistItem(item: BlacklistItem) {
		this.setBlacklist(addItemToArray(this.blacklist, item))
	}

	public append(blacklist: Blacklist) {
		this.blacklist = this.blacklist.concat(blacklist.getItems())
	}

	public removeBlacklistItem(item: BlacklistItem) {
		this.setBlacklist(removeItemFromArray(this.blacklist, item))
	}
}
