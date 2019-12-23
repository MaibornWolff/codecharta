# Contributing
 
Cool, that you are interested in contributing. We like pull request and suggestions from everyone.

If you are planning in making a major contribution we appreciate your opening an issue or contacting [us](mailto:codecharta@github.com).

Some things that will increase the chance that your pull request is accepted:

Write clean code.
Write tests.
Write a good commit message.
Code for Analysis sub-project only in Java and Kotlin languages.

We will *NOT* accept any pull requests that don't follow the Contributor Covenant [code of conduct](CODE_OF_CONDUCT.md).

## Naming conventions

### Pull Requests
- Follow the given template when opening the PR
- Name the PR like its branch name (e.x. `Tech/123/my branch name`). The name is usually created by GitHub automatically
- Add the correct labels
- The tick list *Definition of Done* is not checked by the developer, but by the reviewer
- The PR Assignee is only used by the reviewer to see who is reviewing it

### Branching

Branch names consist of a type and the describing branch name itself, which is always **lowercase** separated by **dashes**. 
It follows this structure `<type>/<issue-id>/<name>`.
For more detailed information check out the source [Branch Types by CKSource](https://docs.ckeditor.com/ckeditor5/latest/framework/guides/contributing/git-commit-message-convention.html) 

| Types         | Changelog     | Description
| ---           | ---           | ---
| `feature`	    | yes           | New feature I add or expand
| `bugfix`	    | yes           | Bug fix
| `codestyle`  	| no            | Our beloved code style improvements / refactorings
| `docs`	    | no            | Updated documentation
| `tech`	    | no            | Other kinds of technical changes
| `revert`      | no            | Revert of some commit

Examples:
- `feature/123/add-settings-option-xyz`
- `bugfix/124/solve-unecpected-settings-errors`

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

#### Correct commits
- ... Add new function to do X #123
- ... Add test for X #123
- ... Refactor subsystem X for readability #123
- ... Update getting started documentation #123
- ... Remove deprecated methods #123
    
#### Wrong commits
- *adding new function to do X for Y* #123
- *added service X* #123
- *adds tests for X* #123
- *fixed bug with Y* #123
- *changing behavior of Y* #123
- *more fixes for broken stuff* #123
- *sweet new API methods* #123



