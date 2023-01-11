export const fileRoot = {
	rootName: "root",
	rootPath: `/root`,
	updateRoot: (name: string) => {
		fileRoot.rootName = name
		fileRoot.rootPath = `/${name}`
	}
}
