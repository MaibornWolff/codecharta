import git
import PyInquirer
import in_place
import pathlib
import subprocess
import datetime
import sys
import json

root = pathlib.Path().absolute()
static_side_path = root.joinpath('gh-pages/visualization/app/')

FORCE = len(sys.argv) == 2 and (sys.argv[1] == "-f" or sys.argv[1] == "--force")
if FORCE:
    print("Force mode enabled. Protections disabled!")

def is_root_folder():
    return root[-10:] == "codecharta"

def is_visualization(repository):
  return repository == "Visualization"

def confirm(message, print_message):
    confirm = [{
        "type": "confirm",
        "name": "confirmed",
        "message": message,
        "default": True
    }]
    confirmation = PyInquirer.prompt(confirm)["confirmed"]

    if confirmation:
        print(print_message)
    else:
        print("Aborting.")
        quit(1)


def get_latest_changelog_entries(path):
    with open(path, "r", encoding="utf-8") as fp:
        line_number = 0
        new_changelog_section = ""

        for line in fp:
            if line_number > 10:

                # break on headline for already released log entries
                if line.startswith("## ["):
                    break

                new_changelog_section += line

            line_number += 1

    return new_changelog_section


def get_release_post(version, prefix_version, path, repository):
    release_post_header = f"---\ncategories:\n  - Release\n  - Release-{repository}\ntags:\n  - gh-pages\n  - release\n  - {repository.lower()}\n\ntitle: {repository} version {version}\n---\n\n"
    release_post_headline = "{{page.title}} is live and ready for"+f" [download](https://github.com/MaibornWolff/codecharta/releases/tag/{prefix_version}). \nThis version brings the following:\n\n"
    release_post_content = get_latest_changelog_entries(path)
    return release_post_header + release_post_headline + release_post_content


def update_changelog(changelog_path):
  with in_place.InPlace(changelog_path, encoding="utf-8") as fp:
    for line in fp:
        if "## [unreleased]" in line:
            fp.write(
                f"## [{new_version}] - {date_formatted}\n")
        else:
            fp.write(line)

  with in_place.InPlace(changelog_path, encoding="utf-8") as fp:
    line_number = 0

    for line in fp:
        if line_number == 6:
            fp.write(
                "\n## [unreleased] (Added 🚀 | Changed | Removed 🗑 | Fixed 🐞 | Chore 👨‍💻 👩‍💻)\n\n")
        else:
            fp.write(line)
        line_number = line_number + 1

def update_readme(readme_path):
  with in_place.InPlace(readme_path, encoding="utf-8") as fp:
    release_line = False

    # line_number in array format -> first line = line 0
    for line in fp:
      if release_line:
        assert("Analysis" in line and "Visualization" in line)
        readme_release_links = line.strip("\n").split("|")
        assert(len(readme_release_links)==2)
        entry_to_change = 1 if(is_visualization(repository)) else 0
        new_entry = f' {repository} <a href="https://github.com/MaibornWolff/codecharta/releases/tag/{new_prefix_version}">{new_version}</a> '
        readme_release_links[entry_to_change] = new_entry
        fp.write("|".join(readme_release_links)+"\n")
        release_line = False
      else:
        if "Latest Release:" in line:
          release_line = True
        fp.write(line)

def verify_git_tags(latest_tag_analysis, latest_tag_visualization):
    analysis_package_json_file = open("analysis/node-wrapper/package.json","r",encoding="utf-8")
    analysis_json = json.load(analysis_package_json_file)
    visualization_package_json_file = open("visualization/package.json","r",encoding="utf-8")
    visualization_json = json.load(visualization_package_json_file)

    if (latest_tag_analysis != analysis_json["version"]):
      print("Latest Analysis tag [{}] does not match package.json version [{}]! Aborting...".format(latest_tag_analysis, analysis_json["version"]))
      print("Please make sure, that there are no unreleased tags remote or locally.")
      quit(1)
    if (latest_tag_visualization != visualization_json["version"]):
      print("Latest Visualization tag [{}] does not match package.json version [{}]! Aborting...".format(latest_tag_visualization, visualization_json["version"]))
      print("Please make sure, that there are no unreleased tags remote or locally.")
      quit(1)

### Release Steps

# Check if we're on project root folder
if not is_root_folder:
    print("Please execute this script from the project root folder. Aborting.")
    quit(1)
else:
    repo = git.Repo(root)

# Check if there are any uncommitted changes
if not FORCE and repo.is_dirty():
    print("Please commit your changes first and/or ignore untracked files in git. Aborting.")
    quit(1)

# Check if we are on main branch
if not FORCE and repo.active_branch.name != "main":
    print("You can only release on main branch. Aborting.")
    quit(1)

# Fetch updates, to ensure the status is UPTODATE (4)
assert(repo.remotes.origin.fetch()[0].flags == 4)

# Get latest tag for visualization and analysis
all_tags_sorted = sorted(repo.tags, key=lambda t: t.commit.committed_datetime)
tags_vis = [tag for tag in all_tags_sorted if tag.name.startswith("vis-")]
tags_ana = [tag for tag in all_tags_sorted if tag.name.startswith("ana-")]
latest_tag_vis = tags_vis[-1].name[4:] if len(tags_vis) else all_tags_sorted[-1].name
latest_tag_ana = tags_ana[-1].name[4:] if len(tags_ana) else all_tags_sorted[-1].name
verify_git_tags(latest_tag_ana, latest_tag_vis)
print(f"Last version tag in git for visualization: {latest_tag_vis}")
print(f"Last version tag in git for analysis {latest_tag_ana}")

# Precalculate new versions
versions_vis = latest_tag_vis.split(".")
versions_ana = latest_tag_ana.split(".")

# mmp = major, minor, patch - versions
mmp_vis = [int(x) for x in versions_vis]
mmp_ana = [int(x) for x in versions_ana]

new_versions_vis = [f"{mmp_vis[0] + 1}.0.0", f"{mmp_vis[0]}.{mmp_vis[1] + 1}.0",f"{mmp_vis[0]}.{mmp_vis[1]}.{mmp_vis[2] + 1}"]
new_versions_ana = [f"{mmp_ana[0] + 1}.0.0", f"{mmp_ana[0]}.{mmp_ana[1] + 1}.0",f"{mmp_ana[0]}.{mmp_ana[1]}.{mmp_ana[2] + 1}"]

# Get release repo
questions_repo = [{
  "type": "list",
  "name": "repository",
  "message": f"Do you want to release Visualization {new_versions_vis} or Analysis {new_versions_ana}?",
  "choices": ["Analysis", "Visualization"]
}]

repository = PyInquirer.prompt(questions_repo)["repository"]
print(f"Releasing a new version for {repository}!")

new_versions = new_versions_vis if(is_visualization(repository)) else new_versions_ana
new_major_version, new_minor_version, new_patch_version = new_versions

# Get release type and version
questions = [{
    "type": "list",
    "name": "version",
    "message": f"In {repository}: Do you want to release a major version [{new_major_version}], minor version [{new_minor_version}] or a patch [{new_patch_version}]?",
    "choices": ["Major", "Minor", "Patch"],
}]

release_type = PyInquirer.prompt(questions)["version"]

if release_type is None:
    quit(1)
elif release_type == "Major":
    new_version = new_major_version
elif release_type == "Minor":
    new_version = new_minor_version
elif release_type == "Patch":
    new_version = new_patch_version

print(f"v{new_version}")

# Confirm release
message = f"In {repository}: Do you REALLY want to release {new_version}? WARNING: File changes need to be undone manually or through git when done unintentionally!"
printMessage = f"Selected {release_type} release. Updating project..."
confirm(message, printMessage)

# get time
date = datetime.datetime.now()
month = date.strftime("%m")
day = date.strftime("%d")
date_formatted = f"{date.year}-{month}-{day}"

# prepare version for blog post
new_prefix_version = ("vis-" if is_visualization(repository) else "ana-")+new_version
new_version_formatted = ("vis_" if is_visualization(repository) else "ana_")+new_version.replace(".", "_")

if(is_visualization(repository)):
  ## Update visualization files

  # bump version in package.json in visualization
  visualization_package = f"{root}/visualization"
  visualization_package_json = f"{visualization_package}/package.json"
  visualization_package_lock_json = f"{visualization_package}/package-lock.json"
  subprocess.run(f"npm --prefix {visualization_package} --no-git-tag-version version {new_version}", shell=True)
  print("incremented version in ./visualization/package.json + locks")

  # update changelog
  changelog_path = f"{root}/visualization/CHANGELOG.md"
  update_changelog(changelog_path)
  print(f"updated {changelog_path}")

  # building webpack
  processInfo = subprocess.run('cd visualization && npm ci && npm run build', shell=True)
  if(processInfo.returncode != 0):
     print("Npm ci in visualization was not successfull. Please check the console output.")
     quit(1)
  subprocess.run(f"rm -rf {str(static_side_path)}", shell=True)
  static_side_path.mkdir(parents=True)
  subprocess.run(f"cp -R 'visualization/dist/webpack/.'  {str(static_side_path)}", shell=True)
else:
  ## Update analysis files

  # bump version in gradle.properties
  gradle_properties = f"{root}/analysis/gradle.properties"

  with in_place.InPlace(gradle_properties, encoding="utf-8") as fp:
      for line in fp:
          if "currentVersion=" in line:
              fp.write(
                  f"currentVersion={new_version}\n")
          else:
              fp.write(line)

  print("incremented version in ./analysis/gradle.properties")

  # bump version in package.json in analysis
  analysis_package = f"{root}/analysis/node-wrapper"
  analysis_package_json = f"{analysis_package}/package.json"
  analysis_package_lock_json = f"{analysis_package}/package-lock.json"

  subprocess.run(f"npm --prefix {analysis_package} --no-git-tag-version version {new_version}", shell=True)
  print("incremented version in ./analysis/node-wrapper/package.json + locks")

  # update changelog
  changelog_path = f"{root}/analysis/CHANGELOG.md"
  update_changelog(changelog_path)
  print(f"updated {changelog_path}")


# add gh-pages release post

release_post = f"{date_formatted}-{new_version_formatted}.md"
release_post_path = f"{root}/gh-pages/_posts/release/{release_post}"

with open(release_post_path, "w", encoding="utf-8") as fp:
    fp.write(get_release_post(new_version, new_prefix_version, changelog_path, repository))

readme_path = f"{root}/README.md"
update_readme(readme_path)

# confirm and make a commit and tag it correctly
message = "Do you want to commit the changes and tag them correctly? WARNING: Commit and Tag need to be undone manually when done unintentionally!"
printMessage = "Committing and tagging..."
confirm(message, printMessage)

if is_visualization(repository):
  repo.git.add(all=True)
else:
  repo.index.add([release_post_path, readme_path, changelog_path, gradle_properties,
                analysis_package_json, analysis_package_lock_json])

subprocess.run('git commit -a -m "Releasing ' + new_prefix_version + '"', shell=True)
tag = repo.create_tag(new_prefix_version, ref="HEAD",
                      message=f"Releasing {new_prefix_version}")

if(FORCE):
  print("Release not allowed in force mode. Quitting...")
  quit(1)

# push
message = "The release is now committed and tagged but not pushed. In order to finish this release you need to push the commit and tag. Push?"
printMessage = "Pushing..."
confirm(message, printMessage)

subprocess.run("git push --follow-tags", shell=True)

print("All done. Check the GitHub page in about half an hour to see if everything worked")
