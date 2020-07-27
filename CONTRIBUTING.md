# Contributing

Cool, that you are interested in contributing. We like pull request and suggestions from everyone.

If you are planning in making a major contribution we appreciate your opening an issue or contacting [us](mailto:codecharta@github.com).

Things that increase the chance that a pull request will be accepted:

- Write clean code.
- Write tests for your new code and regression tests after fixing a bug.
- Write a good commit message and include the issue number at the end `#123`.
- Update the CHANGELOG.md with any changes/additions made

We will _NOT_ accept any pull requests that don't follow the Contributor Covenant [code of conduct](CODE_OF_CONDUCT.md).

## Naming conventions

### Branching

Branch names consist of a type and the describing branch name itself, which is always **lowercase** separated by **dashes**.
It follows this structure `<type>/<issue-id>/<name>`.
For more detailed information check out the source [Branch Types by CKSource](https://docs.ckeditor.com/ckeditor5/latest/framework/guides/contributing/git-commit-message-convention.html)

| Types       | Changelog | Description                                        |
| ----------- | --------- | -------------------------------------------------- |
| `feature`   | yes       | New feature I add or expand                        |
| `bug`       | yes       | Bug fix                                            |
| `docs`      | yes       | Updated documentation                              |
| `codestyle` | no        | Our beloved code style improvements / refactorings |
| `tech`      | no        | Other kinds of technical changes                   |
| `revert`    | no        | Revert of some commit                              |

Examples:

- `feature/123/add-settings-option-xyz`
- `bug/124/solve-unecpected-settings-errors`

### Commit Messages

To unify the appearance of all commit messages we only accept commit messages using the following principles:

- A commit contains the following, while the `<body-description>` is optional:

  ```
  <subject-line> #<issue-id>

  [<body-description>]
  ```

- Separate subject-line from optional body-description with a blank line
- Use the body-description to explain what, why or how within max 72 characters
- Limit the subject line to 50 characters and add the **GitHub Issue Number** with the `#`
- **Capitalize** the subject line
- Do not end the subject line with a full stop
- The subject line always uses the **imperative mood** and is able to **complete the following sentence**:
  > If applied, this commit will ...

#### Good commit messages

- ... Add new function to do X #123
- ... Add test for X #123
- ... Refactor subsystem X for readability #123
- ... Update getting started documentation #123
- ... Remove deprecated methods #123

#### Wrong commits

- _adding new function to do X for Y_ #123
- _added service X_ #123
- _adds tests for X_ #123
- _fixed bug with Y_ #123
- _changing behavior of Y_ #123
- _more fixes for broken stuff_ #123
- _sweet new API methods_ #123

### Pull Requests

- Follow the given template when opening the PR
- Name the PR like its branch name (e.x. `Tech/123/my branch name`). The name is usually created by GitHub automatically
- Add the correct labels
- The tick list _Definition of Done_ is not checked by the developer, but by the reviewer
- The PR Assignee is only used by the reviewer to see who is reviewing it
