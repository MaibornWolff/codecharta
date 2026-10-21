#!/usr/bin/env python3
"""Compare the dependency edges two ccsh builds draw, or one build against the regression probes' expectations.

Usage: compare_dependency_builds.py <new-ccsh> [<old-ccsh>] [--samples]

Runs `dependencyparser --include-tests --bypass-gitignore` on every probe in sample-projects/regression and, with
--samples, on every sample project folder, and prints the edges that differ, in the probes' `expected.txt` format. Without
<old-ccsh> a probe is compared against what its `expected.txt` and `known-gaps.txt` say the parser draws today; the
sample projects have no expectations, so --samples needs <old-ccsh>. The last release is `npx codecharta-analysis` or a
ccsh unpacked from its tarball.

Exit codes: 0 no edge differs, 1 edges differ, 2 wrong arguments or a probe folder without `expected.txt`, 3 a ccsh run
failed, wrote no map or could not analyse a file.
"""
import argparse
import json
import os
import subprocess
import sys
import tempfile

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SAMPLES = os.path.join(REPO, "sample-projects")
PROBES = os.path.join(SAMPLES, "regression")
NOT_SAMPLES = ("tools", "regression", "output")
SAME, DIFFERING, USAGE_ERROR, RUN_FAILED = 0, 1, 2, 3
# The warning ccsh logs for every file it could not analyse while it still writes the map
FILE_FAILED_WARNING = "could not be analysed"


def index_paths(node, prefix, paths):
    path = f"{prefix}/{node['name']}" if prefix else node["name"]
    paths[node["id"]] = path.split("/", 1)[1] if "/" in path else path
    for child in node.get("children", []):
        index_paths(child, path, paths)


def flags(edge):
    return (" cyclic" if edge.get("isCyclic") else "") + (" upward" if edge.get("isPointingUpwards") else "")


def edge_lines(cc_json):
    data = json.load(open(cc_json))
    paths = {}
    for root in data["files"]:
        index_paths(root, "", paths)
    lens = data.get("lenses", {}).get("dependency", {})
    lines = [f"file {paths[e['fromId']]} -> {paths[e['toId']]}{flags(e)}" for e in lens.get("edges", [])]
    for e in lens.get("leafEdges", []):
        usage = ",".join(u for u in e.get("usage", []) if u != "usage")
        usage_text = f" usage={usage}" if usage else ""
        lines.append(f"leaf {paths[e['fromId']]}#{e['fromLeaf']} -> {paths[e['toId']]}#{e['toLeaf']}{usage_text}{flags(e)}")
    return set(lines)


def run(ccsh, folder):
    with tempfile.TemporaryDirectory() as out:
        output = os.path.join(out, "map.cc.json")
        command = [ccsh, "dependencyparser", folder, "--include-tests", "--bypass-gitignore", "-nc", "-o", output]
        try:
            result = subprocess.run(command, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, text=True, check=False)
        except OSError as error:
            fail(RUN_FAILED, f"{ccsh} could not be started: {error}")
        if result.returncode != 0 or not os.path.exists(output):
            fail(RUN_FAILED, f"{ccsh} failed on {folder} (exit code {result.returncode}):\n{result.stderr.strip()[-2000:]}")
        failed_files = [line for line in result.stderr.splitlines() if FILE_FAILED_WARNING in line]
        if failed_files:
            fail(RUN_FAILED, f"{ccsh} could not analyse files in {folder}:\n" + "\n".join(failed_files))
        return edge_lines(output)


def fail(exit_code, message):
    print(message, file=sys.stderr)
    sys.exit(exit_code)


def lines_of(path):
    if not os.path.exists(path):
        return set()
    return {line for line in open(path).read().splitlines() if line.strip() and not line.startswith("#")}


def drawn_today(directory):
    gaps = lines_of(os.path.join(directory, "known-gaps.txt"))
    missing = {line.removeprefix("missing ") for line in gaps if line.startswith("missing ")}
    extra = {line.removeprefix("extra ") for line in gaps if line.startswith("extra ")}
    return lines_of(os.path.join(directory, "expected.txt")) - missing | extra


def report(name, old, new):
    gone, added = sorted(old - new), sorted(new - old)
    if gone or added:
        print(f"== {name}")
        for line in gone:
            print(f"  - {line}")
        for line in added:
            print(f"  + {line}")
    return bool(gone or added)


def probe_folders():
    """Every folder below the probes root that holds a `src` folder; one without `expected.txt` is an error."""
    folders = sorted(root for root, dirs, _ in os.walk(PROBES) if "src" in dirs)
    folders = [folder for folder in folders if not any(folder.startswith(other + os.sep) for other in folders)]
    without_expectation = [folder for folder in folders if not os.path.exists(os.path.join(folder, "expected.txt"))]
    if without_expectation:
        fail(USAGE_ERROR, "probe folders without expected.txt: " + ", ".join(without_expectation))
    return folders


def parse_arguments():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[1], allow_abbrev=False)
    parser.add_argument("new_ccsh")
    parser.add_argument("old_ccsh", nargs="?")
    parser.add_argument("--samples", action="store_true")
    arguments = parser.parse_args()
    if arguments.samples and not arguments.old_ccsh:
        parser.error("--samples needs <old-ccsh>: the sample projects have no expectations to compare against")
    return arguments


def main():
    arguments = parse_arguments()
    differing = 0
    for directory in probe_folders():
        sources = os.path.join(directory, "src")
        new = run(arguments.new_ccsh, sources)
        old = run(arguments.old_ccsh, sources) if arguments.old_ccsh else drawn_today(directory)
        differing += report(os.path.relpath(directory, PROBES), old, new)
    if arguments.samples:
        for sample in sorted(os.listdir(SAMPLES)):
            folder = os.path.join(SAMPLES, sample)
            if os.path.isdir(folder) and sample not in NOT_SAMPLES:
                differing += report(f"sample-projects/{sample}", run(arguments.old_ccsh, folder), run(arguments.new_ccsh, folder))
    print(f"{differing} differing")
    sys.exit(DIFFERING if differing else SAME)


if __name__ == "__main__":
    main()
