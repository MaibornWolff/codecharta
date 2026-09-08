#!/usr/bin/env python3
"""Convert the `dependency` lens of a cc.json 2.0 file into DependaCharta's `.cg.json`.

    ./script/ccjson_to_cgjson.py out.cc.json -o out.cg.json

The result opens in DependaCharta's Web Studio (https://maibornwolff.github.io/DependaCharta/), so the
graph `ccsh dependencyparser` produces can be compared there against a DependaCharta run of the same
project.

Only `lenses.dependency.{leaves,namespaces,leafEdges}` and the `files` tree are read. The lens `edges`
are deliberately ignored: they address file nodes and may carry metrics merged in from a piped
project, so they are not the declaration graph DependaCharta works in.
"""

import argparse
import gzip
import json
import sys
from collections import OrderedDict
from pathlib import Path

GZIP_MAGIC = b"\x1f\x8b"
FILES_ROOT_NAME = "root"
DEFAULT_USAGE_TYPE = "usage"
UNKNOWN_LANGUAGE = "UNKNOWN"

# DependaCharta names the language on every leaf; these are the names of its own enum, which the
# ported `SupportedLanguage` shares.
LANGUAGE_BY_EXTENSION = {
    "php": "PHP",
    "cs": "C_SHARP",
    "ts": "TYPESCRIPT",
    "tsx": "TYPESCRIPT",
    "cts": "TYPESCRIPT",
    "mts": "TYPESCRIPT",
    "js": "JAVASCRIPT",
    "jsx": "JAVASCRIPT",
    "cjs": "JAVASCRIPT",
    "mjs": "JAVASCRIPT",
    "java": "JAVA",
    "go": "GO",
    "py": "PYTHON",
    "pyw": "PYTHON",
    "cpp": "CPP",
    "cc": "CPP",
    "cxx": "CPP",
    "hpp": "CPP",
    "hxx": "CPP",
    "hh": "CPP",
    "c": "CPP",
    "h": "CPP",
    "kt": "KOTLIN",
    "kts": "KOTLIN",
    "vue": "VUE",
    "pas": "DELPHI",
    "dpr": "DELPHI",
    "dpk": "DELPHI",
    "rs": "RUST",
}


def read_json(path):
    raw = Path(path).read_bytes()
    text = gzip.decompress(raw) if raw[:2] == GZIP_MAGIC else raw
    return json.loads(text.decode("utf-8"))


def dependency_lens(document):
    lens = document.get("lenses", {}).get("dependency")
    if not lens:
        sys.exit("no dependency lens in this file; run it through `ccsh dependencyparser` first")
    if "leaves" not in lens:
        sys.exit("the dependency lens has no `leaves`; it was written without the logical layer")
    return lens


# The file tree is rooted in a node named `root` that stands for the analysis root itself, so its own
# name is dropped and every path below it is repository-relative, the way DependaCharta writes them.
def paths_by_node_id(document):
    paths = {}

    def walk(node, prefix):
        path = f"{prefix}/{node['name']}" if prefix else node["name"]
        if "id" in node:
            paths[node["id"]] = path
        for child in node.get("children") or []:
            walk(child, path)

    for root in document.get("files") or []:
        for child in root.get("children") or []:
            walk(child, "" if root.get("name") == FILES_ROOT_NAME else root.get("name", ""))
    return paths


def language_of(physical_path):
    extension = physical_path.rsplit(".", 1)[-1].lower() if "." in physical_path else ""
    return LANGUAGE_BY_EXTENSION.get(extension, UNKNOWN_LANGUAGE)


def outgoing_edges_by_leaf(leaf_edges):
    outgoing = {}
    for edge in leaf_edges:
        outgoing.setdefault(edge["fromLeaf"], []).append(edge)
    return outgoing


def dependency_record(edge, is_pointing_upwards):
    usage = edge.get("usage") or []
    return {
        "isCyclic": bool(edge.get("isCyclic", False)),
        "weight": edge.get("attributes", {}).get("dependencies", 1),
        "type": usage[0] if usage else DEFAULT_USAGE_TYPE,
        "isPointingUpwards": is_pointing_upwards,
    }


def build_leaves(lens, paths, outgoing):
    leaves = OrderedDict()
    for leaf_id, leaf in lens["leaves"].items():
        physical_path = paths.get(leaf.get("nodeId"), "")
        leaves[leaf_id] = {
            "id": leaf_id,
            "name": leaf.get("name", leaf_id.rsplit(".", 1)[-1]),
            "physicalPath": physical_path,
            "nodeType": leaf.get("kind", "UNKNOWN"),
            "language": language_of(physical_path),
            # DependaCharta always writes false here and carries the real flag on the tree node, so a
            # viewer reading either field sees what it would see for a DependaCharta run.
            "dependencies": {
                edge["toLeaf"]: dependency_record(edge, False) for edge in outgoing.get(leaf_id, [])
            },
        }
    return leaves


def aggregate_dependencies(leaf_ids, outgoing):
    aggregated = OrderedDict()
    for leaf_id in leaf_ids:
        for edge in outgoing.get(leaf_id, []):
            target = edge["toLeaf"]
            record = aggregated.get(target)
            if record is None:
                aggregated[target] = dependency_record(edge, bool(edge.get("isPointingUpwards", False)))
                continue
            record["weight"] += edge.get("attributes", {}).get("dependencies", 1)
            record["isCyclic"] = record["isCyclic"] or bool(edge.get("isCyclic", False))
            record["isPointingUpwards"] = record["isPointingUpwards"] or bool(edge.get("isPointingUpwards", False))
    return aggregated


def parent_path_of(path):
    return path.rsplit(".", 1)[0] if "." in path else None


def name_of(path):
    return path.rsplit(".", 1)[-1]


class TreeBuilder:
    """Builds DependaCharta's namespace tree, where a node either names a declaration (`leafId`) or
    contains other nodes, but never both: a declaration with declarations nested inside it therefore
    gets a container node beside its leaf node, exactly as DependaCharta emits it."""

    def __init__(self, namespace_levels, leaf_levels):
        self.namespace_levels = namespace_levels
        self.leaf_levels = leaf_levels
        self.containers = {}
        self.roots = []

    def container(self, path):
        node = self.containers.get(path)
        if node is not None:
            return node
        node = {
            "name": name_of(path),
            "children": [],
            "level": self.namespace_levels.get(path, self.leaf_levels.get(path, 0)),
            "containedLeaves": [],
            "containedInternalDependencies": {},
        }
        self.containers[path] = node
        self.attach(path, node)
        return node

    def attach(self, path, node):
        parent = parent_path_of(path)
        if parent is None:
            self.roots.append(node)
        else:
            self.container(parent)["children"].append(node)

    def add_leaf(self, path, level):
        node = {
            "leafId": path,
            "name": name_of(path),
            "children": [],
            "level": level,
            "containedLeaves": [path],
            "containedInternalDependencies": {},
        }
        self.attach(path, node)
        return node


def build_tree(lens, outgoing):
    namespace_levels = {path: entry.get("level", 0) for path, entry in lens["namespaces"].items()}
    leaf_levels = {path: entry.get("level", 0) for path, entry in lens["leaves"].items()}

    builder = TreeBuilder(namespace_levels, leaf_levels)
    for path in sorted(namespace_levels):
        builder.container(path)

    leaf_nodes = {}
    for path in sorted(leaf_levels):
        leaf_nodes[path] = builder.add_leaf(path, leaf_levels[path])

    # A container for every declaration that has declarations nested inside it, created after the leaf
    # nodes so it lands beside the leaf it shares a path with.
    for path in sorted(leaf_levels):
        if any(other.startswith(f"{path}.") for other in leaf_levels):
            builder.container(path)

    fill_containment(builder.containers, leaf_nodes, leaf_levels, outgoing)
    return builder.roots


def fill_containment(containers, leaf_nodes, leaf_levels, outgoing):
    contained = {path: [] for path in containers}
    for leaf_path in sorted(leaf_levels):
        ancestor = parent_path_of(leaf_path)
        while ancestor is not None:
            if ancestor in contained:
                contained[ancestor].append(leaf_path)
            ancestor = parent_path_of(ancestor)

    for path, node in containers.items():
        node["containedLeaves"] = contained[path]
        node["containedInternalDependencies"] = aggregate_dependencies(contained[path], outgoing)
    for path, node in leaf_nodes.items():
        node["containedInternalDependencies"] = aggregate_dependencies([path], outgoing)


def convert(document):
    lens = dependency_lens(document)
    outgoing = outgoing_edges_by_leaf(lens.get("leafEdges") or [])
    paths = paths_by_node_id(document)
    return {
        "projectTreeRoots": build_tree(lens, outgoing),
        "leaves": build_leaves(lens, paths, outgoing),
    }


def report(project, lens):
    node_count = 0

    def count(node):
        nonlocal node_count
        node_count += 1
        for child in node.get("children") or []:
            count(child)

    for root in project["projectTreeRoots"]:
        count(root)
    print(
        f"{len(project['leaves'])} leaves, {len(lens.get('leafEdges') or [])} leaf edges, "
        f"{len(lens.get('namespaces') or {})} namespaces -> {node_count} tree nodes in "
        f"{len(project['projectTreeRoots'])} roots"
    )


def parse_args():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("input", type=Path, help="cc.json 2.0 file with a dependency lens (may be gzipped)")
    parser.add_argument("-o", "--output", type=Path, help="output file (default: the input with a .cg.json suffix)")
    parser.add_argument("--indent", type=int, default=None, help="pretty-print the output with this indent")
    return parser.parse_args()


def main():
    args = parse_args()
    document = read_json(args.input)
    project = convert(document)
    output = args.output or args.input.with_suffix("").with_suffix(".cg.json")
    output.write_text(json.dumps(project, indent=args.indent), encoding="utf-8")
    report(project, dependency_lens(document))
    print(f"written to {output}")


if __name__ == "__main__":
    main()
