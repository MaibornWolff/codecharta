// import Treemap from "./Treemap"
// import { CodeMapNode } from "../../codeCharta.model";
// import Point from "../point";
// import { StreetLayoutValuedCodeMapNode } from "../streetLayoutGenerator";
// import Rectangle from "../rectangle";

// export default class SquarifiedTreemap extends Treemap {
//     constructor(rootNode: CodeMapNode, metricName: string) {
//         super(rootNode, metricName);
//     }

//     public layout(origin: Point = new Point(0, 0)): StreetLayoutValuedCodeMapNode[] {
//         const rectangle = new Rectangle(origin, this.width, this.height);
//         const rootNode = new VisualNode(rectangle, this.node, Color.Folder);
//         const children = this.node.children.filter(value => this.size(value) > 0);

//         this.treemapNodes.push(rootNode);

//         if (children.length === 0) {
//             return this.treemapNodes
//         };
//         this.createNodes(children, rectangle, this.size(this.node));

//         return this.treemapNodes;
//     }

//     protected createNodes(nodes: CodeMapNode[], rect: Rectangle, rootSize: number): void {
//         let processedNodesCount = 0;
//         let currentRect = new Rectangle(new Point(rect.topLeft.x, rect.topLeft.y), rect.width, rect.height);
//         let currentRootSize = rootSize;
//         let orderedNodes = this.orderBySizeDescending(nodes);

//         do {
//             const currentStrip = this.createStrip(currentRect, orderedNodes.slice(processedNodesCount), currentRootSize);
//             const stripSize = currentStrip.totalSize(this.metricName);

//             if (stripSize > 0) {
//                 const stripNodes = this.createStripNodes(currentStrip, currentRect, currentRootSize);
//                 this.createChildrenNodes(stripNodes);
//                 currentRect = this.remainingRectangle(currentRect, currentStrip, currentRootSize, currentRect.area());
//                 currentRootSize -= stripSize;
//             }
//             processedNodesCount += currentStrip.nodes.length;
//         } while (processedNodesCount < orderedNodes.length); /* as long as there are children to process */
//     }

//     protected createStrip(rect: Rectangle, nodes: CodeMapNode[], rootSize: number): Strip {
//         const firstNode = nodes[0];
//         const currentStrip = rect.isVertical()
//             ? new HorizontalStrip([firstNode])
//             : new VerticalStrip([firstNode]);

//         currentStrip.populate(nodes.slice(1), rect, rootSize, this.metricName);

//         return currentStrip;
//     }

//     protected remainingRectangle(rect: Rectangle, strip: Strip, parentSize: number, parentArea: number): Rectangle {
//         const stripSize = strip.totalScaledSize(strip.nodes, this.metricName, parentSize, parentArea);

//         let newOrigin: Point;
//         let width = rect.width;
//         let height = rect.height;

//         if (strip instanceof HorizontalStrip) {
//             const stripHeight = stripSize / rect.width;
//             height -= stripHeight;
//             newOrigin = new Point(rect.topLeft.x, rect.topLeft.y + stripHeight);
//         } else {
//             const stripWidth = stripSize / rect.height;
//             width -= stripWidth;
//             newOrigin = new Point(rect.topLeft.x + stripWidth, rect.topLeft.y);
//         }
//         return new Rectangle(newOrigin, width, height);
//     }

//     protected createStripNodes(strip: Strip, rect: Rectangle, rootSize: number, order?: number): VisualNode[] {
//         const stripNodes = strip.layout(rect, rootSize, this.metricName, order);
//         this.treemapNodes.push(...stripNodes);
//         return stripNodes;
//     }

//     protected createChildrenNodes(stripNodes: VisualNode[]): void {
//         for (let node of stripNodes) {
//             const children = node.node.children.filter(node => node.size(this.metricName) > 0 );
//             if (children.length > 0) {
//                 const size = node.node.size(this.metricName);
//                 this.createNodes(children, node.rectangle, size);
//             }
//         }
//     }

//     private orderBySizeDescending(nodes: CCNode[]): CCNode[] {
//         return nodes.sort((a, b) => { return b.size(this.metricName) - a.size(this.metricName) });
//     }

//     protected size(node: CodeMapNode): number {
//         //calculates size of subelements recursively
//         let totalSize = 0;
//         if(node.children.length > 0) {
//             for (let child of node.children) {
//                 totalSize += this.size(child);
//             }
//             return totalSize;
//         }
//         //Node is 'File' and should have attribute
//         let metricValue = node.attributes[this.metricName]
//         if (!metricValue) {
//             metricValue = 0; //nodes that don't have the metric key are ignored
//         }
//         return metricValue;
//     }
// }
