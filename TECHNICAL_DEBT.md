## Introduction

_When do I add technical debt to this list?_

- If you **come across** code, that you want to **refactor** in the future
- If you **create** technical debt, that only requires **refactoring** to fix

<br>

_When do I create an issue on github instead?_

- If you **create** technical debt, because you had to implement the first solution

## Template

- Created **OR** Found By: {Developer, who created/found the debt}
- Description: {Why is it technical debt?}
- Solution: {How would you fix it?}
- Files: {List of files the technical debt is found in}

# List of technical debt

### Blacklist as a class

- Found By: Ben Willenbring
- Description: We have the blacklist defined as an array of BlacklistItems.
  It would be better to move translate that into a class and hide the datastructure in it
  and export methods to operate on the datastructure for a more domain-specific language.
- Solution:
  1. Create a class BlacklistItem and collect common functionality used to operate on single entries
  2. Create a class Blacklist and collect common functionaility used to operate on the whole list
  3. Replace all occurences of BlacklistItem[] and BlacklistItem with the new classes
- Files: Too many to list
