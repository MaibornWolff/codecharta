export class ThreeUpdateCycleService {
	private updatables: Function[] = []

	public register(onUpdate: Function) {
		this.updatables.push(onUpdate)
	}

	public update() {
		this.updatables.forEach((u: Function) => u())
	}
}
