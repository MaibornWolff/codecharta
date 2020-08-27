# API-Changelog

## 1.1

-   An additional optional property `edges` has been added to the `cc.json`
-   Defines an array of edges between buildings
-   Use SCMLogParser to generate edges

```ts
export interface Edge {
	fromNodeName: string
	toNodeName: string
	attributes: KeyValuePair
}
```

## 1.2

-   An additional optional property `fixed` has been added to the `cc.json`
-   Property can be set to direct children of the root-folder
-   Define `x` and `y` as the top-left corner of the folder
-   Define `width` and `height` for the length in x and y-direction
-   Folders can't overlap and must be defined in range of `[0-100]`

```ts
export interface Fixed {
	x: number
	y: number
	width: number
	height: number
}
```
