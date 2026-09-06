#!/usr/bin/env python3
"""Print the dependency and domain lenses of a cc.json 2.0 file in a form that is easy to diff by eye.

Usage: dump_lenses.py <file.cc.json> [--words N]
"""
import json
import sys


def index_paths(node, prefix, paths):
    path = f"{prefix}/{node['name']}" if prefix else node["name"]
    paths[node["id"]] = path
    for child in node.get("children", []):
        index_paths(child, path, paths)


def strip_root(path):
    return path.split("/", 1)[1] if "/" in path else path


def dump_dependency(lens, paths):
    edges = lens.get("edges", [])
    print(f"## File edges ({len(edges)})")
    for edge in sorted(edges, key=lambda e: (paths.get(e["fromId"], ""), paths.get(e["toId"], ""))):
        flags = [flag for flag in ("isCyclic", "isPointingUpwards") if edge.get(flag)]
        flag_text = f"  [{', '.join(flags)}]" if flags else ""
        count = edge.get("attributes", {}).get("dependencies", "?")
        print(f"{strip_root(paths.get(edge['fromId'], edge['fromId']))} -> {strip_root(paths.get(edge['toId'], edge['toId']))}  x{count}{flag_text}")
    leaves = lens.get("leaves", {})
    print(f"\n## Leaves ({len(leaves)})")
    for key, leaf in sorted(leaves.items()):
        print(f"{key}  kind={leaf.get('kind')} level={leaf.get('level')}")
    leaf_edges = lens.get("leafEdges", [])
    print(f"\n## Leaf edges ({len(leaf_edges)})")
    for edge in sorted(leaf_edges, key=lambda e: (e["fromLeaf"], e["toLeaf"])):
        usage = ",".join(edge.get("usage", []))
        print(f"{edge['fromLeaf']} -> {edge['toLeaf']}  usage={usage}")
    print("\n## Node levels")
    for node_id, info in sorted(lens.get("nodes", {}).items(), key=lambda item: paths.get(item[0], "")):
        print(f"{strip_root(paths.get(node_id, node_id))}  level={info.get('level')}")


def dump_domain(lens, paths, word_limit):
    nodes = lens.get("nodes", {})
    print(f"## Domain words per node ({len(nodes)} nodes, top {word_limit})")
    for node_id, info in sorted(nodes.items(), key=lambda item: paths.get(item[0], "")):
        words = info.get("words", [])
        top = ", ".join(f"{w['text']}({w['frequency']})" for w in words[:word_limit])
        print(f"{strip_root(paths.get(node_id, node_id))}: {top}")


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    word_limit = 25
    if "--words" in sys.argv:
        word_limit = int(sys.argv[sys.argv.index("--words") + 1])
    data = json.load(open(sys.argv[1]))
    paths = {}
    for root in data["files"]:
        index_paths(root, "", paths)
    lenses = data.get("lenses", {})
    if lenses.get("dependency", {}).get("edges") or lenses.get("dependency", {}).get("leaves"):
        dump_dependency(lenses["dependency"], paths)
    if lenses.get("domain", {}).get("nodes"):
        dump_domain(lenses["domain"], paths, word_limit)
    metrics = lenses.get("metrics", {}).get("attributes", {})
    if metrics:
        print("\n## Metrics per file")
        for node_id, attrs in sorted(metrics.items(), key=lambda item: paths.get(item[0], "")):
            print(f"{strip_root(paths.get(node_id, node_id))}: {json.dumps(attrs)}")


if __name__ == "__main__":
    main()
