import { NodeType } from "../../codeCharta.model"
import { ExportCCFile } from "../../codeCharta.api.model"

export const fileWithFixedFolders: ExportCCFile = {
	projectName: "example-project",
	apiVersion: "1.2",
	fileChecksum: "",
	nodes: [
		{
			name: "root",
			type: NodeType.FOLDER,
			attributes: {},
			children: [
				{
					name: "folder_1",
					type: NodeType.FOLDER,
					attributes: {},
					children: [
						{
							name: "children_1",
							type: NodeType.FILE,
							attributes: {
								custom_metric: 2
							},
							children: []
						},
						{
							name: "children_2",
							type: NodeType.FILE,
							attributes: {
								custom_metric: 4
							},
							children: []
						},
						{
							name: "children_3",
							type: NodeType.FILE,
							attributes: {
								custom_metric: 6
							},
							children: []
						}
					],
					fixedPosition: {
						left: 5,
						top: 5,
						width: 55,
						height: 15
					}
				},
				{
					name: "folder_2",
					type: NodeType.FOLDER,
					attributes: {},
					children: [
						{
							name: "children_4",
							type: NodeType.FILE,
							attributes: {
								custom_metric: 10
							},
							children: []
						},
						{
							name: "children_5",
							type: NodeType.FILE,
							attributes: {
								custom_metric: 0
							},
							children: []
						}
					],
					fixedPosition: {
						left: 5,
						top: 25,
						width: 25,
						height: 50
					}
				},
				{
					name: "folder_3",
					type: NodeType.FOLDER,
					attributes: {},
					children: [
						{
							name: "children_6",
							type: NodeType.FILE,
							attributes: {
								custom_metric: 4
							},
							children: []
						},
						{
							name: "children_7",
							type: NodeType.FILE,
							attributes: {
								custom_metric: 0
							},
							children: []
						}
					],
					fixedPosition: {
						left: 35,
						top: 25,
						width: 25,
						height: 50
					}
				},
				{
					name: "folder_4",
					type: NodeType.FOLDER,
					attributes: {},
					children: [
						{
							name: "children_8",
							type: NodeType.FILE,
							attributes: {
								custom_metric: 20
							},
							children: []
						},
						{
							name: "children_9",
							type: NodeType.FILE,
							attributes: {
								custom_metric: 5
							},
							children: []
						}
					],
					fixedPosition: {
						left: 65,
						top: 5,
						width: 10,
						height: 90
					}
				},
				{
					name: "folder_5",
					type: NodeType.FOLDER,
					attributes: {},
					children: [
						{
							name: "children_10",
							type: NodeType.FILE,
							attributes: {
								custom_metric: 10
							},
							children: []
						},
						{
							name: "children_11",
							type: NodeType.FILE,
							attributes: {
								custom_metric: 0
							},
							children: []
						}
					],
					fixedPosition: {
						left: 80,
						top: 5,
						width: 15,
						height: 90
					}
				},
				{
					name: "folder_6",
					type: NodeType.FOLDER,
					attributes: {},
					children: [
						{
							name: "children_12",
							type: NodeType.FILE,
							attributes: {
								custom_metric: 1
							},
							children: []
						},
						{
							name: "children_13",
							type: NodeType.FILE,
							attributes: {
								custom_metric: 1
							},
							children: []
						}
					],
					fixedPosition: {
						left: 5,
						top: 80,
						width: 55,
						height: 15
					}
				}
			]
		}
	],
	edges: [
		{
			fromNodeName: "/root/folder_1/children_1",
			toNodeName: "/root/folder_2/children_4",
			attributes: {
				pairingRate: 89,
				avgCommits: 34
			}
		},
		{
			fromNodeName: "/root/folder_2/children_4",
			toNodeName: "/root/folder_3/children_5",
			attributes: {
				pairingRate: 32,
				avgCommits: 17
			}
		}
	]
}
