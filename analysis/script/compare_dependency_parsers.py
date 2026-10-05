#!/usr/bin/env python3
"""Compare the dependency graph DependaCharta emits with the one `ccsh dependencyparser` emits.

Run both tools on a project and diff the results:

    ./script/compare_dependency_parsers.py path/to/project

Or compare two files that already exist:

    ./script/compare_dependency_parsers.py --dependacharta-json out.cg.json --codecharta-json out.cc.json

Both outputs are normalised into the same four tables — declarations (leaves), dependencies between
declarations (leaf edges), namespace levels and file-to-file edges — and every table is diffed by key.
A declaration is keyed the way the cc.json addresses it, by its file and its key within that file, and
only the namespaces ccsh lists are compared: the packages a language declares apart from its files.
Self-edges (a declaration depending on itself) are dropped on both sides unless --keep-self-edges is
given, because ccsh drops them by design and they would otherwise show up as a difference on every run.
The exit code is 0 when the graphs agree and 1 when they differ, so the script can guard a CI job.
"""

import argparse
import json
import os
import subprocess
import sys
from dataclasses import dataclass, field
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent.parent
DEFAULT_CCSH = SCRIPT_DIR.parent / "build" / "install" / "codecharta-analysis" / "bin" / "ccsh"
DEPENDACHARTA_CHECKOUT = REPO_ROOT / "Ideas" / "DC" / "DependaCharta" / "analysis"
# A fresh `./gradlew fatJar` lands in build/libs; the checked-in bin/ copy lags behind the sources.
DEFAULT_DEPENDACHARTA_JARS = [DEPENDACHARTA_CHECKOUT / "build" / "libs" / "dependacharta.jar", DEPENDACHARTA_CHECKOUT / "bin" / "dependacharta.jar"]
DEPENDACHARTA_JAR_ENV = "DEPENDACHARTA_JAR"
DEPENDACHARTA_VIRTUAL_ROOT = "__virtual_root__"
DEPENDACHARTA_DEFAULT_MAX_FILE_SIZE_KB = 1024
DEPENDACHARTA_DEFAULT_FILE_TIMEOUT_SECONDS = 60
DEPENDENCIES_ATTRIBUTE = "dependencies"
LEAF_ADDRESS_SEPARATOR = "#"
PACKAGE_LANGUAGES = {"PHP", "C_SHARP", "JAVA", "CPP", "KOTLIN"}
DEPENDACHARTA_LABEL = "DependaCharta"
CODECHARTA_LABEL = "CodeCharta"


@dataclass
class DependencyModel:
    leaves: dict = field(default_factory=dict)
    leaf_edges: dict = field(default_factory=dict)
    namespaces: dict = field(default_factory=dict)
    file_edges: dict = field(default_factory=dict)


@dataclass
class SectionDiff:
    name: str
    only_left: list
    only_right: list
    changed: list
    total_left: int
    total_right: int

    @property
    def difference_count(self):
        return len(self.only_left) + len(self.only_right) + len(self.changed)


def read_dependacharta(path):
    report = json.load(open(path, encoding="utf-8"))
    addresses = addresses_by_leaf_id(report["leaves"])
    model = DependencyModel()
    for leaf_id, leaf in report["leaves"].items():
        model.leaves[addresses[leaf_id]] = {"name": leaf["name"], "kind": leaf["nodeType"].lower(), "file": leaf["physicalPath"]}
    packages = declared_packages(report["leaves"])
    for root in report["projectTreeRoots"]:
        collect_dependacharta_tree(root, [], model, addresses, packages)
    model.file_edges = collapse_to_file_edges(model)
    return model


# ccsh keys a declaration by its name, or by its dotted path when two declarations of one file share it.
def addresses_by_leaf_id(leaves):
    ids_by_file_and_name = {}
    for leaf_id, leaf in leaves.items():
        ids_by_file_and_name.setdefault((leaf["physicalPath"], leaf["name"]), []).append(leaf_id)
    return {
        leaf_id: leaf_address(file, name if len(leaf_ids) == 1 else leaf_id)
        for (file, name), leaf_ids in ids_by_file_and_name.items()
        for leaf_id in leaf_ids
    }


def leaf_address(file, leaf_key):
    return f"{file}{LEAF_ADDRESS_SEPARATOR}{leaf_key}"


# The namespaces ccsh lists: the package of every declaration of a package language, and what contains
# it. A declaration nested in another one of its file belongs to that one's package, and a path that
# merely re-encodes the file is no package.
def declared_packages(leaves):
    ids_by_file = {}
    for leaf_id, leaf in leaves.items():
        ids_by_file.setdefault(leaf["physicalPath"], set()).add(leaf_id)
    packages = set()
    for leaf_id, leaf in leaves.items():
        if leaf.get("language") not in PACKAGE_LANGUAGES:
            continue
        segments = leaf_id.split(".")[:-1]
        while segments and ".".join(segments) in ids_by_file[leaf["physicalPath"]]:
            segments.pop()
        if segments == [segment.replace(".", "_") for segment in leaf["physicalPath"].split("/") if segment]:
            continue
        packages.update(".".join(segments[:depth]) for depth in range(1, len(segments) + 1))
    return packages


def collect_dependacharta_tree(node, parent_segments, model, addresses, packages):
    segments = parent_segments if node["name"] == DEPENDACHARTA_VIRTUAL_ROOT else parent_segments + [node["name"]]
    dotted = ".".join(segments)
    leaf_id = node.get("leafId")
    if leaf_id:
        model.leaves.setdefault(addresses[leaf_id], {})["level"] = node["level"]
        for target, info in node["containedInternalDependencies"].items():
            model.leaf_edges[(addresses[leaf_id], addresses.get(target, target))] = leaf_edge_record(
                info["weight"], info["type"].split(","), info["isCyclic"], info.get("isPointingUpwards", False)
            )
        return
    if dotted in packages:
        model.namespaces[dotted] = {"level": node["level"], "parent": ".".join(segments[:-1]) or None}
    for child in node["children"]:
        collect_dependacharta_tree(child, segments, model, addresses, packages)


def collapse_to_file_edges(model):
    file_edges = {}
    for (source, target), edge in model.leaf_edges.items():
        source_file = model.leaves.get(source, {}).get("file")
        target_file = model.leaves.get(target, {}).get("file")
        if not source_file or not target_file or source_file == target_file:
            continue
        existing = file_edges.setdefault((source_file, target_file), file_edge_record(0, False, False))
        existing["weight"] += edge["weight"]
        existing["isCyclic"] = existing["isCyclic"] or edge["isCyclic"]
        existing["isPointingUpwards"] = existing["isPointingUpwards"] or edge["isPointingUpwards"]
    return file_edges


def read_codecharta(path):
    project = json.load(open(path, encoding="utf-8"))
    lens = project.get("lenses", {}).get("dependency", {})
    path_by_id = {}
    for root in project["files"]:
        collect_codecharta_paths(root, [], path_by_id)
    model = DependencyModel()
    for node_id, leaves_of_file in lens.get("leaves", {}).items():
        file = path_by_id.get(node_id, node_id)
        for leaf_key, leaf in leaves_of_file.items():
            model.leaves[leaf_address(file, leaf_key)] = {
                "name": leaf.get("name", leaf_key),
                "kind": leaf["kind"],
                "file": file,
                "level": leaf.get("level"),
            }
    for edge in lens.get("leafEdges", []):
        source = leaf_address(path_by_id.get(edge["fromId"], edge["fromId"]), edge["fromLeaf"])
        target = leaf_address(path_by_id.get(edge["toId"], edge["toId"]), edge["toLeaf"])
        model.leaf_edges[(source, target)] = leaf_edge_record(
            edge_weight(edge), edge.get("usage", []), edge.get("isCyclic", False), edge.get("isPointingUpwards", False)
        )
    model.namespaces = {
        name: {"level": entry.get("level"), "parent": entry.get("parent")} for name, entry in lens.get("namespaces", {}).items()
    }
    for edge in lens.get("edges", []):
        source = path_by_id.get(edge["fromId"], edge["fromId"])
        target = path_by_id.get(edge["toId"], edge["toId"])
        model.file_edges[(source, target)] = file_edge_record(
            edge_weight(edge), edge.get("isCyclic", False), edge.get("isPointingUpwards", False)
        )
    return model


def collect_codecharta_paths(node, parent_segments, path_by_id):
    segments = parent_segments + [node["name"]] if parent_segments or node["name"] != "root" else []
    path_by_id[node["id"]] = "/".join(segments)
    for child in node.get("children", []):
        collect_codecharta_paths(child, segments, path_by_id)


def edge_weight(edge):
    return edge.get("attributes", {}).get(DEPENDENCIES_ATTRIBUTE, 0)


def leaf_edge_record(weight, usage, is_cyclic, is_pointing_upwards):
    return {
        "weight": weight,
        "usage": sorted(set(usage)),
        "isCyclic": bool(is_cyclic),
        "isPointingUpwards": bool(is_pointing_upwards),
    }


def file_edge_record(weight, is_cyclic, is_pointing_upwards):
    return {"weight": weight, "isCyclic": bool(is_cyclic), "isPointingUpwards": bool(is_pointing_upwards)}


def drop_self_edges(model):
    self_edges = [key for key in model.leaf_edges if key[0] == key[1]]
    for key in self_edges:
        del model.leaf_edges[key]
    return len(self_edges)


def diff_models(left, right):
    return [
        diff_table("leaves", left.leaves, right.leaves),
        diff_table("leaf edges", left.leaf_edges, right.leaf_edges),
        diff_table("namespaces", left.namespaces, right.namespaces),
        diff_table("file edges", left.file_edges, right.file_edges),
    ]


def diff_table(name, left, right):
    only_left = sorted(key for key in left if key not in right)
    only_right = sorted(key for key in right if key not in left)
    changed = []
    for key in sorted(key for key in left if key in right):
        fields = differing_fields(left[key], right[key])
        if fields:
            changed.append((key, fields))
    return SectionDiff(name, only_left, only_right, changed, len(left), len(right))


def differing_fields(left, right):
    return {name: (left.get(name), right.get(name)) for name in sorted(set(left) | set(right)) if left.get(name) != right.get(name)}


def format_key(key):
    return f"{key[0]} -> {key[1]}" if isinstance(key, tuple) else str(key)


def print_report(sections, limit):
    print(f"{'section':<12} {DEPENDACHARTA_LABEL:>13} {CODECHARTA_LABEL:>11} {'only DC':>8} {'only CC':>8} {'changed':>8}")
    for section in sections:
        print(
            f"{section.name:<12} {section.total_left:>13} {section.total_right:>11} "
            f"{len(section.only_left):>8} {len(section.only_right):>8} {len(section.changed):>8}"
        )
    for section in sections:
        if section.difference_count:
            print_section_details(section, limit)


def print_section_details(section, limit):
    print(f"\n== {section.name}")
    print_key_list(f"only in {DEPENDACHARTA_LABEL}", section.only_left, limit)
    print_key_list(f"only in {CODECHARTA_LABEL}", section.only_right, limit)
    if section.changed:
        print(f"  changed ({len(section.changed)}):")
        for key, fields in section.changed[:limit]:
            details = ", ".join(f"{name}: {left!r} vs {right!r}" for name, (left, right) in fields.items())
            print(f"    {format_key(key)}  [{details}]")
        print_truncation_notice(len(section.changed), limit)


def print_key_list(title, keys, limit):
    if not keys:
        return
    print(f"  {title} ({len(keys)}):")
    for key in keys[:limit]:
        print(f"    {format_key(key)}")
    print_truncation_notice(len(keys), limit)


def print_truncation_notice(count, limit):
    if count > limit:
        print(f"    ... {count - limit} more (raise --limit or use --json)")


def sections_as_json(sections):
    return {
        section.name: {
            "totals": {DEPENDACHARTA_LABEL: section.total_left, CODECHARTA_LABEL: section.total_right},
            "onlyDependaCharta": [format_key(key) for key in section.only_left],
            "onlyCodeCharta": [format_key(key) for key in section.only_right],
            "changed": [{"key": format_key(key), "fields": fields} for key, fields in section.changed],
        }
        for section in sections
    }


def report_dropped_self_edges(dependacharta_count, codecharta_count):
    if dependacharta_count or codecharta_count:
        print(
            f"ignoring self-edges: {dependacharta_count} in {DEPENDACHARTA_LABEL}, {codecharta_count} in {CODECHARTA_LABEL} "
            "(--keep-self-edges to compare them)\n"
        )


# Both tools run with the work directory as their cwd, so every path they receive is made absolute first.
def run_dependacharta(jar, project, work_dir, extra_args):
    output_dir = (work_dir / "dependacharta").resolve()
    command = ["java", "-jar", str(jar), "-d", str(project.resolve()), "-o", str(output_dir), "-f", "analysis", "-c", *extra_args]
    run_tool(command, cwd=work_dir)
    return output_dir / "analysis.cg.json"


def run_codecharta(ccsh, project, work_dir, extra_args):
    output = (work_dir / "codecharta.cc.json").resolve()
    command = [
        str(ccsh),
        "dependencyparser",
        str(project.resolve()),
        "-o",
        str(output),
        "-nc",
        f"--max-file-size={DEPENDACHARTA_DEFAULT_MAX_FILE_SIZE_KB}",
        f"--file-timeout={DEPENDACHARTA_DEFAULT_FILE_TIMEOUT_SECONDS}",
        *extra_args,
    ]
    run_tool(command, cwd=work_dir)
    return output


def run_tool(command, cwd):
    print(f"$ {' '.join(command)}", file=sys.stderr)
    result = subprocess.run(command, cwd=cwd)
    if result.returncode != 0:
        sys.exit(f"command failed with exit code {result.returncode}: {command[0]}")


def resolve_dependacharta_jar(explicit):
    candidates = [explicit, os.environ.get(DEPENDACHARTA_JAR_ENV), *DEFAULT_DEPENDACHARTA_JARS]
    for candidate in candidates:
        if candidate and Path(candidate).is_file():
            return Path(candidate)
    sys.exit(f"DependaCharta jar not found; pass --dependacharta-jar or set {DEPENDACHARTA_JAR_ENV}")


def resolve_ccsh(explicit):
    ccsh = Path(explicit) if explicit else DEFAULT_CCSH
    if ccsh.is_file():
        return ccsh
    sys.exit(f"ccsh not found at {ccsh}; build it with 'cd analysis && ./gradlew installDist' or pass --ccsh")


def parse_args():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("project", nargs="?", type=Path, help="project directory to analyse with both tools")
    parser.add_argument("--dependacharta-json", type=Path, help="existing DependaCharta .cg.json to compare instead of running")
    parser.add_argument("--codecharta-json", type=Path, help="existing cc.json to compare instead of running")
    parser.add_argument("--dependacharta-jar", help=f"DependaCharta fat jar (default: ${DEPENDACHARTA_JAR_ENV} or the Ideas/DC checkout)")
    parser.add_argument("--ccsh", help=f"ccsh launcher (default: {DEFAULT_CCSH})")
    parser.add_argument("--work-dir", type=Path, default=Path("compare-dependency-parsers"), help="where the tool outputs go")
    parser.add_argument("--dc-arg", action="append", default=[], help="extra argument for DependaCharta (repeatable)")
    parser.add_argument("--cc-arg", action="append", default=[], help="extra argument for ccsh dependencyparser (repeatable)")
    parser.add_argument("--keep-self-edges", action="store_true", help="count declaration self-edges, which ccsh drops by design")
    parser.add_argument("--limit", type=int, default=20, help="entries listed per difference kind")
    parser.add_argument("--json", type=Path, help="write the full diff as JSON to this file")
    args = parser.parse_args()
    has_files = args.dependacharta_json and args.codecharta_json
    if bool(args.project) == bool(has_files):
        parser.error("pass either a project directory or both --dependacharta-json and --codecharta-json")
    return args


def main():
    args = parse_args()
    if args.project:
        project = args.project.resolve()
        args.work_dir.mkdir(parents=True, exist_ok=True)
        dependacharta_json = run_dependacharta(resolve_dependacharta_jar(args.dependacharta_jar), project, args.work_dir, args.dc_arg)
        codecharta_json = run_codecharta(resolve_ccsh(args.ccsh), project, args.work_dir, args.cc_arg)
    else:
        dependacharta_json, codecharta_json = args.dependacharta_json, args.codecharta_json

    dependacharta, codecharta = read_dependacharta(dependacharta_json), read_codecharta(codecharta_json)
    if not args.keep_self_edges:
        report_dropped_self_edges(drop_self_edges(dependacharta), drop_self_edges(codecharta))
    sections = diff_models(dependacharta, codecharta)
    print_report(sections, args.limit)
    if args.json:
        args.json.write_text(json.dumps(sections_as_json(sections), indent=2))
        print(f"\nfull diff written to {args.json}")
    differences = sum(section.difference_count for section in sections)
    print(f"\n{'outputs agree' if differences == 0 else f'{differences} differences'}")
    return 0 if differences == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
