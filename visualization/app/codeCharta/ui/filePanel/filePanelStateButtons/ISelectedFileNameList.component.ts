export interface ISelectedFileNameListComponent {
	single: string
	delta: {
		reference: string
		comparison: string
	}
	partial: string[]
}
