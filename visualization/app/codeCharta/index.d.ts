declare module "*.html" {
	const content: string
	export default content
}

declare module "*.png" {
	const value: any
	export = value
}
