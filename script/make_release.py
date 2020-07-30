import pathlib
import git
import inquirer


def isRootFolder():
    currentDir = pathlib.Path().absolute()
    return "visualization" not in currentDir and "analysis" not in currentDir

# Requirements


# Check if we're on project root folder
if not isRootFolder:
    print("Please execute this script from the project root folder. Aborting.")
    quit()
else:
    repo = git.Repo(pathlib.Path().absolute())


# Check if there are any uncommited changes
if repo.is_dirty():
    print("Please commit your changes first and/or ignore untracked files in git. Aborting.")
    quit()

# Check if we are on master branch
if repo.head != "master":
    print("You can only release on master branch. Aborting.")
    quit()

# Get latest tag
latest_tag = sorted(repo.tags)[-1]
print(f"Last version tag in git is {latest_tag}")

# Precalc new versions
versions = latest_tag.split(".")
new_major_version = versions[0]
new_minor_version = versions[1]
new_patch_version = versions[2]

# Get release type and version
questions = [
    inquirer.List('version',
                  message=f"Do you want to release a major version [{new_major_version}], minor version [{new_minor_version}] or a patch [{new_patch_version}]?",
                  choices=["Major", "Minor", "Patch"],
                  ),
]
answer = inquirer.prompt(questions)

new_version = ""

if answer == "":
    quit()
if answer == "Major":
    new_version = new_major_version
if answer == "Minor":
    new_version = new_minor_version
if answer == "Patch":
    new_version = new_patch_version
