# StructureModifier

The StructureModifier is used to modify the structure of .cc.json files. It enables to ...

- remove nodes from a project. The resulting project will not include these nodes and their children.
- declare a node as root. This means that the chosen node will become the root node of the resulting sub-project.
- move nodes within the project. All children of the source node will be transferred to the destination node.
- print the hierarchy of the project.

The edges and blacklist entries associated with moved/removed nodes will be altered as well, while all attribute types will be copied.

## Usage

```
ccsh modify [-h] [-f=<moveFrom>] [-o=<outputFile>]
                   [-p=<printLevels>] [-s=<setRoot>] [-t=<moveTo>]
                   [-r=<remove>...]... [FILE]
```

### Parameters

```
      [FILE]                 input project file
  -f, --move-from=<moveFrom>  move nodes in project folder...
  -h, --help                 displays this help and exits
  -o, --output-file=<outputFile>
                             output File (or empty for stdout)
  -p, --print-levels=<printLevels>
                             show first x layers of project hierarchy
  -r, --remove=<remove>...   node(s) to be removed
  -s, --set-root=<setRoot>    path within project to be extracted
  -t, --move-to=<moveTo>      ... move nodes to destination folder
```

## Examples

> sh ccsh modify foo.cc.json -p=2

> sh ccsh modify foo.cc.json --remove=/root/foo --remove=/root/bar/

> sh ccsh modify foo.cc.json --move-from=/root/foo --move-to=/root/bar -output-file=project.cc.json

> sh ccsh modify foo.cc.json --set-root=/root/foo/

## Piped input

Instead of providing a cc.json file as input, a project can also be piped to the filter:

```
cat demo.cc.json | sh ccsh modify -p=2
```
