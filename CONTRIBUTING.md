# Contributing

Cool, that you are interested in contributing. We like pull request and suggestions from everyone.

If you are planning in making a major contribution we appreciate your opening an issue or contacting [us](mailto:codecharta@github.com).

Things that increase the chance that a pull request will be accepted:

- Write clean code.
- Write tests for your new code and regression tests after fixing a bug.
- Write a good commit message and include the issue number at the end `#123`.
- Update the CHANGELOG.md with any changes/additions made

This project is bound by a [Code of Conduct](CODE_OF_CONDUCT.md).

## Naming conventions

### Branching

Branch names consist of a type and the describing branch name itself, which is always **lowercase** separated by **dashes**.
It follows this structure `<type>/<issue-id>/<name>`.
For more detailed information check out the source [Branch Types by CKSource](https://docs.ckeditor.com/ckeditor5/latest/framework/guides/contributing/git-commit-message-convention.html)

| Types       | Changelog | Description                                        |
| ----------- | --------- | -------------------------------------------------- |
| `feature`   | yes       | New feature I add or expand                        |
| `fix`       | yes       | Bug fix                                            |
| `docs`      | yes       | Updated documentation                              |
| `revert`    | yes       | Revert of some commit                              |
| `codestyle` | no        | Our beloved code style improvements / refactorings |
| `tech`      | no        | Other kinds of technical changes                   |

Examples:

- `feature/123/add-settings-option-xyz`
- `fix/124/solve-unecpected-settings-errors`

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

#### Bad commit messages

- _adding new function to do X for Y_ #123
- _added service X_ #123
- _adds tests for X_ #123
- _fixed bug with Y_ #123
- _changing behavior of Y_ #123
- _more fixes for broken stuff_ #123
- _sweet new API methods_ #123

### Pull Requests

- Follow the given template when opening the PR
- Name the PR like its branch name (e.g. `Tech/123/my branch name`). The name is usually created by GitHub automatically
- Add the correct labels
- The PR Assignee is only used by the reviewer to see who is reviewing it

## Changelog Guidelines

### Why do we write a changelog?

- A changelog is vital for the developers to keep track of their work. But most importantly now that it appears on every version update to every user, we should make sure that it is also user-friendly. And for that, we need guidelines to help us.

### When should you add to the changelog file?

- You should always make sure that a changelog entry has been added before merging your work.

### How should you format a changelog entry?

- [Description of what you changed] [Link to the pull request]
  [One picture (specify the width and/or height)]<br/>
  Example:<br/>
  `- Description ([#1315](pull-request-link)) <br>`<br/>
  `![image-size](image-ling)`<br/>
- Please do not forget the `_<br>` at the end before the img tag (with a space). This breaks the two lines and is compatible with our parsers.

### How to write a good description?

- The description should be precise and short to provide the user with all necessary information. If it is needed, add some precise notes about the usage of the new feature.
- One changelog entry should describe one change.
- Avoid writing technical descriptions
- Start with a verb in the present tense
  - Example: Add, Improve, Enable, Allow, Switch...
  - Don’t: this feature added the ability to enable dark mode
  - Do: Add dark mode
- Avoid writing ambiguous descriptions
  - Don’t: Fix some UI problems
  - Do: Fix the distribution bar not showing correctly
- Write in terms of features. Focus on the "what" not the "how".
  - Don’t: Minify JS and CSS
  - Do: Make page load faster by reducing size of JavaScript and CSS files

### Notes

- Link to the image can be copied from an image uploaded to the Pull Request
- If there are no Pull Requests associated to your change, link an issue.
- The image should always have a width and/or a height attribute.
  - Example: width=”350px”

## Recommended Setup

If you have any questions about the project setup, check out the [Dev-Start-Guide](DEV_START_GUIDE.md)!
