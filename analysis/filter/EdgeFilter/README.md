# EdgeFilter

Generates visualisation data from a cc.json file with edges data.
For every node its edge-attributes get aggregated and inserted as node-attribute.
After using this command the file can also be visualized inside the visualization, because the `edgefilter` creates nodes,
if they did not exist before.

## Usage

`ccsh edgefilter edges.cc.json -o visual_edges.cc.json`
