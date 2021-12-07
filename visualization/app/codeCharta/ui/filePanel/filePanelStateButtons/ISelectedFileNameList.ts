export interface ISelectedFileNameList {
	single: string
	delta: {
		reference: string
		comparison: string
	}
	partial: string[]
}
