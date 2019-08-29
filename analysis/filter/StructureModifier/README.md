# StructureModifier

The StructureModifier is used to modify the structure of .cc.json files. It enables to ...
- remove nodes from a project. The resulting project will not include these nodes and their children.
- declare a node as root. This means that the chosen node will become the root node of the resulting sub-project.
- move nodes within the project. All children of the source node will be transferred to the destination node.
- print the hierarchy of the project.

The edges and blacklist entries associated with moved/removed nodes will be altered as well, while all attribute types will be copied.

## Usage

```
ccsh modify [-h] [-f=<moveFrom>] [-n=<projectName>] [-o=<outputFile>]
                   [-p=<printLevels>] [-s=<setRoot>] [-t=<moveTo>]
                   [-r=<remove>...]... [FILE]
```

### Parameters

```
      [FILE]                 input project file
  -f, --moveFrom=<moveFrom>  move nodes in project folder...
  -h, --help                 displays this help and exits
  -n, --projectName=<projectName>
                             project name of new file
  -o, --outputFile=<outputFile>
                             output File (or empty for stdout)
  -p, --printLevels=<printLevels>
                             show first x layers of project hierarchy
  -r, --remove=<remove>...   node(s) to be removed
  -s, --setRoot=<setRoot>    path within project to be extracted
  -t, --moveTo=<moveTo>      ... move nodes to destination folder
```


## Examples

> sh ccsh modify foo.cc.json -p=2

> sh ccsh modify foo.cc.json --remove=/root/foo --remove=/root/bar/

> sh ccsh modify foo.cc.json --moveFrom=/root/foo --moveTo=/root/bar -outputFile=project.cc.json

> sh ccsh modify foo.cc.json --setRoot=/root/foo/ --projectName=NewName

 ## Piped input

 Instead of providing a cc.json file as input, a project can also be piped to the filter:
 ```
 cat demo.cc.json | sh ccsh modify -p=2
 ```
