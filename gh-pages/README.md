# CodeCharta Docs

The CodeCharta docs use [Jekyll](https://jekyllrb.com) and the [Minimal Mistakes (MM) Theme](https://mmistakes.github.io/minimal-mistakes/). The target of the docs are users (the ones that use the ccsh and the web version) and developers (the ones that maintain and extend CodeCharta). These audiences share similar concerns. As an example most users don't need to know how to write a new importer. They could benefit from the context view however.

## Usage

The generated docs can be viewed locally before being pushed to Github (see below). Please note that some files like the web version of CodeCharta are **generated** by `.travis.yml` with the help of the `script/build_gh_pages.sh`. They won't show up locally unless you call that script. If you run the script you should find a new folder called `gh-pages/visualization` though.

### Local

1. [Install Ruby](https://www.ruby-lang.org/en/documentation/installation/) version 2.4.0 or above (check with `ruby -v`). I had a lot of fun with this one because macOS comes with an old Ruby version. [Rubyenv](https://github.com/rbenv/rbenv#installation) did wonders for me (you can skip these steps if you use rbenv already or have some other way to aquire ruby):
   - `brew install rbenv`
   - Add `eval "$(rbenv init -)"` to the `~/.bash_profile`
   - Close terminal
   - `which ruby` should now point to _~/.rbenv/shims/ruby_
   - `rbenv install -v 2.6.3`
   - OPTIONAL to create a `.ruby-version` in `gh-pages`
   - `cd gh-pages` to go into the docs directory
   - `rbenv local 2.6.3`
   - `ruby -v` should now be 2.6.3 for this directory
   - `bundle` to install all gems
     - `gem install bundler:2.0.2` and `bundle update --bundler` in case the bundler needs to be updated first
   - `bundle exec jekyll serve` to build the site and make it available on a local server
   - Now browse to http://localhost:4000

### Github

Github uses Jekyll to [render static site](https://help.github.com/en/articles/about-github-pages-and-jekyll) content for Github-Pages. Content in a top-level _docs folder_ or in a _branch gh-pages_ is automatically rendered.

Github does not support all Jekyll plugins however and only supports those it has [whitelisted](https://pages.github.com/versions/).

## Modify the docs

In case it's important the technical underpinnings of Jekyll and Minimal Mistakes are described in the [Tech Chapter](#tech).

## Draw.io

The `assets/img/*.drawio.*` files can be opened directly with [Draw.io](https://about.draw.io/integrations/#integrations_offline). Download Draw.io, click on File->Open and select the image file. Yes you can open an image file directly. This is because we exported the image with a complete copy of the diagram in the meta-data: File->Export As->PNG then "Include copy of my diagram".

## Tech

Jekyll is a static site renderer written in Ruby and most notably it is directly supported by Github. By default it does not provide any look-and-feel for your sites. MM provides that theme (css, layouts, some js etc.) and also adds very nice things like search.

At first sight Jekyll is very simple. Basically "all" it does is copy files from your project structure to the generated folder called `_site`. So if you place an `index.html` in your project root, it'll also be in the root of `_site`. What creates value is that Jekyll can also modify the files during the copy operation, provided we tell it to:

- either we place a file in a [special Jekyll folder](https://jekyllrb.com/docs/structure/) like `_pages` or `_posts`
- a [custom collection folder](https://jekyllrb.com/docs/collections/) like `_docs`
- or we place special [front matter header](https://jekyllrb.com/docs/front-matter/) in the **beginning** of the file

The Front Matter Header in an html file:

```html
---
title: Some Title
customVariable: Dave
---

<p>Hi {{customVariable}}</p>
```

In all cases the file is processed using the [Liquid Template Engine](https://jekyllrb.com/docs/liquid/) which we can use to replace parts of the file with any variable that is available. Some variables like `{{date}}` are predefined by Jekyll. But we can also define our own custom variables like `{{customVariable}}` in the Front Matter Header or in the `_config.yml`.

### Configuration

Besides defining global variables, the `_config.yml` is also used to configure Jekyll and the MM Theme. It also contains some comments that explain what the variables do. To further understand what the variables do it's best to check out the [Jekyll Configuration](https://jekyllrb.com/docs/configuration/) and the [MM Configuration](https://mmistakes.github.io/minimal-mistakes/docs/configuration/). Please note that changes to the `_config.yml` won't be picked up by `bundle exec jekyll serve`. You need to stop and restart that command.

- Available [MM Layouts](https://mmistakes.github.io/minimal-mistakes/docs/layouts/)
- Create a [MM Image Gallery](https://mmistakes.github.io/minimal-mistakes/docs/helpers/#gallery)
- Change the [MM docs navigation list](https://mmistakes.github.io/minimal-mistakes/docs/layouts/#custom-sidebar-navigation-menu)
- Auto-generate [MM Table of Contents](https://mmistakes.github.io/minimal-mistakes/docs/helpers/#table-of-contents) for a page
- [Align text blocks with MM](https://mmistakes.github.io/minimal-mistakes/docs/utility-classes/#text-alignment)
- Make links standout more with [MM buttons](https://mmistakes.github.io/minimal-mistakes/docs/utility-classes/#buttons)
- Place special [MM Notice blocks](https://mmistakes.github.io/minimal-mistakes/docs/utility-classes/#notices) around text

### Modifying the Template

MM can be modified by copying files from MM directly and changing their content. Take a look at the files in `_includes`.

### Markdown

Jekyll uses kramdown to parse Markdown. Please take a look at its [qickref](https://kramdown.gettalong.org/syntax.html#links-and-images). Also please use this format for internal links between markdown files: `[visualization]({% link _docs/06-01-visualization.md %})`. It has the benefit that the build will fail locally if a file cannot be found.

## Troubleshoot Docs Generation

### Port Occupied

- `netstat -vanp tcp | grep 4000`
- `kill <pid>`

## Initial Project Creation

- `mkdir -p <project>/docs`
- `cd <project>`
- `rbenv local 2.6.3`
- `cd docs`
- `jekyll new .`
- Read [Minimal Mistakes Quickstart](https://mmistakes.github.io/minimal-mistakes/docs/quick-start-guide/)
- Set the remote theme: `remote_theme: "mmistakes/minimal-mistakes"`
- ???
- Profit
