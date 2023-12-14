# StructureModifier

The StructureModifier modifies .cc.json files.\
Perform one of the following actions at a time:

-   Use `-r, --remove=<remove>` to eliminate nodes from a project, excluding them and their children.
-   Use `-s, --set-root=<setRoot>` to designate a node as the root, making it the root of the resulting sub-project.
-   Use `-f, --move-from=<moveFrom>` and `-t, --move-to=<moveTo>` to move nodes within the project, transferring all children of the source node to the destination node.
-   Use `-p, --print-levels=<printLevels>` to display the project hierarchy.

Specifying multiple actions in a single command results in only one being performed.\
Edges and blacklist entries associated with moved or removed nodes will be adjusted, and all attribute types will be copied.

## Usage and Parameters

| Parameter                          | description                                                                                                                      |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `[FILE]`                           | input project file                                                                                                               |
| `-f, --move-from=<moveFrom>`       | move nodes in project folder...                                                                                                  |
| `-h, --help`                       | displays this help and exits                                                                                                     |
| `-o, --output-file=<outputFile>`   | output File (or empty for stdout)                                                                                                |
| `-p, --print-levels=<printLevels>` | show first x layers of project hierarchy                                                                                         |
| `-r, --remove=<remove>`            | comma-separated list of nodes to be removed (when using powershell, the list either can't contain spaces or has to be in quotes) |
| `-s, --set-root=<setRoot>`         | path within project to be extracted                                                                                              |
| `-t, --move-to=<moveTo>`           | ... move nodes to destination folder                                                                                             |

```
Usage: ccsh modify [-h] [-f=<moveFrom>] [-o=<outputFile>] [-p=<printLevels>]
                   [-s=<setRoot>] [-t=<moveTo>] [-r=<remove>]... [FILE]
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
