// TODO: Do not use `Function` as type. See the eslint description for further
// informations.
/* eslint-disable @typescript-eslint/ban-types */
export class ThreeUpdateCycleService {
	private updatables: Function[] = []

	public register(onUpdate: Function) {
		this.updatables.push(onUpdate)
	}

	public update() {
		this.updatables.forEach(u => u())
	}
}
