# Publishing new version

## Prerequisites

- `pip` command must be installed (it is probably already installed, if you have installed Python).
- The python packaging tool must be installed. If not run `pip install pipenv` and then `pipenv install`.

> Be aware, that the current version of analysis must be able to analyse the repository as described in `script/build_demo_file_*.sh`! Do not try to release the visualization, when analysis is broken!

## Manual checks

Before you continue with the release, you should check the following things:

For both releases, Analysis must be in a working state, as the code from the repository will be analyzed for the release.
For the Visualization release, the project must be built, so it is advisable to manually install the dependencies, build and package the project locally beforehand for testing. You can find the required commands in the `package.json`.

## Start the automatic release process

- Call `pipenv run make_release`.
- On Windows it is recommended to run the command in `cmd.exe` rather than in a git bash.
- Check the release process on GitHub after the script is completed

> You can add `-f` or `--force` to disable the protections of the script. You can't release in force mode.
> This is especially useful when testing changes on the release script

## Explanation of the script

- The script will ask you what version you want to increase (major, minor, patch). Read the [Versioning Strategy Guide](https://maibornwolff.github.io/codecharta/docs/versioning/) first.
- The version number will be updated automatically in corresponding files.
- The Changelog section `[unreleased]` will be renamed to the release date like e.g. `[2020-12-12]` and a new `[unreleased]` section will be added on top of the Changelog.
- A release post will be created for the GitHub Pages with the corresponding release notes from the Changelog.
- If you release visualization, a static version of our webpack will be copied to our github-pages folder to enable the webdemo, when analysis is released.
- You will be asked if you want to commit and tag the automatically changed files and thus, the release itself.
- Then you will be asked if you want to push the release commits finally.
- Our build pipeline will detect the new release (tag) and starts a build to publish the new release as npm packages on npmjs.com and our images to docker

> There are checks in place to verify that your local repository is in the correct state before releasing:
> e.g. location (codecharta/), branch (main), status (clean working directory), fetch (up-to-date)

### Release Failure

If there is an error during the release process make sure to undo changes carefully:

- Revert the release commit (`git revert your-commit-hash && git push`)
- Delete the version tag (locally and remote)

> If faulty versions get (partially) published to npm or docker take the appropriate actions to fix them. Either by
> developing a hotfix (and/or) removing the versions from npm/docker if possible.
