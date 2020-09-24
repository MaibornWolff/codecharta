# Scenario: deltas

## Given

-   CC is running
-   deltas not enabled

## When

-   selects/hovers building

## Then

-   no delta values are shown

# Scenario: url params

## Given

-   CC is running

## When

-   user attaches invalid params to the url and navigates to the page

## Then

-   nothing changes

# Scenario: url params

## Given

-   CC is running

## When

-   user clicks url param button

## Then

-   dialog with current params opens

# Scenario: url params

## Given

-   CC is running

## When

-   user changes settings

## Then

-   nothing in url changes (one way change)

# Scenario: url params

## Given

-   CC is running

## When

-   user attaches valid params to the url and does not navigate to the page

## Then

-   nothing changes

# Scenario: url params

## Given

-   CC is running

## When

-   user attaches valid params to the url and navigates to the page

## Then

-   initial settings should be overwritten and correctly rendered

# Scenario: rendering

## Given

-   CC is running

## When

-   user clicks/hovers outside of buildings

## Then

-   detail panel renders correctly

# Scenario: rendering

## Given

-   CC is running

## When

-   user hovers building

## Then

-   building hovered and colored
-   detail panel shows up correctly

# Scenario: rendering

## Given

-   CC is running

## When

-   user hovers building and selects another

## Then

-   building hovered and colored, selected and colored
-   detail panel shows up correctly

# Scenario: rendering

## Given

-   CC is running

## When

-   user left clicks building

## Then

-   building selected and colored
-   detail panel shows up correctly

# Scenario: rendering

## Given

-   CC is running

## When

-   user right click drags the map

## Then

-   moving map

# Scenario: rendering

## Given

-   CC is running

## When

-   user left click drags the map

## Then

-   orbiting around map

# Scenario: rendering

## Given

-   CC is running

## When

-   user scrolls

## Then

-   zooming map

# Scenario: settingspanel sections

## Given

-   CC is running
-   statistics section is open

## When

-   statistic NOTHING selected

## Then

-   everything should be back to normal

# Scenario: settingspanel sections

## Given

-   CC is running
-   statistics section is open

## When

-   statistic X selected

## Then

-   legend panel indicates statistic X
-   revision panel tells that the current selected file is a combination of all filenames and X
-   revision panel does not give any selection (TODO or resets X to nothing ?)

# Scenario: settingspanel sections

## Given

-   CC is running
-   experimental section is open

## When

-   mode enabled
-   same comparison and reference map

## Then

-   legend and revision panel change accordingly
-   detail panel shows mode (0)
-   base color becomes grey
-   delta blocks should not appear

# Scenario: settingspanel sections

## Given

-   CC is running
-   experimental section is open

## When

-   mode enabled
-   different comparison and reference map

## Then

-   legend and revision panel change accordingly
-   detail panel shows mode
-   base color becomes grey
-   delta blocks appear in green or red

# Scenario: settingspanel sections

## Given

-   CC is running
-   experimental section is open

## When

-   user changes margin

## Then

-   map margin changes

# Scenario: settingspanel sections

## Given

-   CC is running
-   scenario section is open

## When

-   user hovers a scenario

## Then

-   explaining tooltip shows up

# Scenario: settingspanel sections

## Given

-   CC is running
-   scenario section is open
-   another map is loaded

## When

-   user clicks changes scenario

## Then

-   map should remain since scenarios do change settings but not the map

# Scenario: settingspanel sections

## Given

-   CC is running
-   scenario section is open

## When

-   user clicks default scenario after initial startup

## Then

-   nothing should happen since it is the default scenario

# Scenario: settingspanel sections

## Given

-   CC is running
-   scenario section is open

## When

-   user changes some scenario relevant settings

## Then

-   maps should be rerendeered according to the given scenario

# Scenario: settingspanel sections

## Given

-   CC is running
-   scenario section is open

## When

-   user clicks scenario twice after initial startup

## Then

-   nothing should happen since it is the default scenario

# Scenario: settingspanel sections

## Given

-   CC is running
-   metrics section is open

## When

-   user changes metrics

## Then

-   map changes accordingly
-   legend panel renders correct metrics
-   detail panel renders correct metrics

# Scenario: settingspanel sections

## Given

-   CC is running
-   metrics section is open

## When

-   user hovers over metric

## Then

-   correct tooltip appears

# Scenario: settingspanel sections

## Given

-   CC is running
-   scaling section is open

## When

-   user changes scaling

## Then

-   map scales accordingly

# Scenario: settingspanel sections

## Given

-   CC is running
-   display section is open

## When

-   user changes amount of labels

## Then

-   amount of highest buildings have their labels rendered

# Scenario: settingspanel sections

## Given

-   CC is running
-   color section is open

## When

-   user changes inversion state

## Then

-   map colors are inverted
-   legend panel colors are adjusted

# Scenario: settingspanel sections

## Given

-   CC is running
-   color section is open

## When

-   user changes neutral color range

## Then

-   map colors are adjusted
-   legend panel colors are adjusted

# Scenario: settingspanel

## Given

-   CC is running

## When

-

## Then

-   all ui's, sections, legend panel, revision panel should be in sync with the default settings

# Scenario: settingspanel

## Given

-   CC is running
-   settingspanel open

## When

-   user clicks section title

## Then

-   section expands
-   section content is visible

# Scenario: settingspanel

## Given

-   CC is running
-   user clicked menu button

## When

-   user clicks menu close button

## Then

-   menu closes

# Scenario: settingspanel

## Given

-   CC is running

## When

-   user clicks menu button

## Then

-   menu opens
-   every section has title and icon
-   sections are closed
-   url param button exists
-   close button exists

# Scenario: filechooser upload

## Given

-   CC is running
-   file selection dialog is open

## When

-   user selects invalid file/files

## Then

-   new maps are not rendered
-   old maps stay rendered
-   some kind of error message

# Scenario: filechooser upload

## Given

-   CC is running
-   file selection dialog is open

## When

-   user selects valid file/files

## Then

-   new maps rendered
-   maps in revision/map chooser (depending on delta)
-   metrics are map metrics
-   default scenario applied

# Scenario: filechooser upload

## Given

-   CC is running
-   filechooser panel is open

## When

-   user clicks select button

## Then

-   File Selection Dialog opens

# Scenario: filechooser closing

## Given

-   CC is running
-   filechooser panel is open

## When

-   user successfully uploads a valid map

## Then

-   filechooser panel is not visible

# Scenario: filechooser closing

## Given

-   CC is running
-   filechooser panel is open

## When

-   user clicks cancel button

## Then

-   filechooser panel is not visible

# Scenario: filechooser closing

## Given

-   CC is running
-   filechooser panel is open

## When

-   user clicks outside the panel

## Then

-   filechooser panel is not visible

# Scenario: filechooser opening

## Given

-   CC is running
-   user clicked filechooser button once

## When

-   user clicks on filechooser button

## Then

-   filechooser panel is not visible

# Scenario: filechooser opening

## Given

-   CC is running

## When

-   user clicks on filechooser button

## Then

-   filechooser panel is visible

# Scenario: revision/maps panel should behave correctly

## Given

-   CC is running
-   revision/maps panel is open

## When

-   user changes map

## Then

-   settings do not change

# Scenario: revision/maps panel should behave correctly

## Given

-   CC is running
-   multiple maps are loaded
-   revision/maps panel is open
-   mode disabled

## When

-   user selects map

## Then

-   correct map should be rendered

# Scenario: revision/maps panel should behave correctly

## Given

-   CC is running
-   multiple maps are loaded
-   revision/maps panel is open
-   mode enabled

## When

-   user selects reference map and comparison map (multiple cases possible)

## Then

-   correct delta map should be rendered

# Scenario: revision/maps panel should render correctly

## Given

-   CC is running
-   multiple maps are loaded
-   revision/maps panel is open
-   mode enabled

## When

-   nothing

## Then

-   revision/maps panel should render one link per map with the filename as a label as a reference map selector
-   revision/maps panel should render one link per map with the filename as a label as a comparison map selector

# Scenario: revision/maps panel should render correctly

## Given

-   CC is running
-   multiple maps are loaded
-   revision/maps panel is open
-   mode disabled

## When

-   nothing

## Then

-   revision/maps panel should render one link per map with the filename as a label

# Scenario: one map loaded

## Given

-   CC is running
-   one map is loaded

## When

-   nothing

## Then

-   revision/maps button should not be visible

# Scenario: multiple maps loaded and mode disabled

## Given

-   CC is running
-   two maps are loaded
-   mode disabled

## When

-   nothing

## Then

-   revision button should be called maps not revisions

# Scenario: multiple maps loaded and mode enabled

## Given

-   CC is running
-   two maps are loaded
-   mode enabled

## When

-   nothing

## Then

-   revision button should be called revisions not maps

# Scenario: User clicks revision/maps panel button

## Given

-   CC is running
-   User clicked the revision/maps panel button once
-   revision/maps panel is visible

## When

-   User clicks revision/maps panel button

## Then

-   revision/maps panel is not visible

# Scenario: User clicks legend panel button

## Given

-   CC is running
-   User clicked the legend panel button once
-   legend panel is visible

## When

-   User clicks legend panel button

## Then

-   legend panel is not visible

# Scenario: User clicks legend panel button

## Given

-   CC is running
-   mode enabled

## When

-   User clicks legend panel button

## Then

-   selected, area-, height- and color metric are rendered correctly according to default values
-   colors are not shown
-   delta informations should be shown

# Scenario: User clicks legend panel button

## Given

-   CC is running
-   mode disabled

## When

-   User clicks legend panel button

## Then

-   selected, colors, area-, height- and color metric are rendered correctly according to default values
-   delta informations should not be shown

# Scenario: User starts CC and opens its webpage

## Given

-   CC is running

## When

-   user opens CC

## Then

-   Sample file is rendered
-   legend button exists
-   maps button exists
-   menu button exists
-   file open button exists
-   correct version is rendered
-   mbw icon exists
-   title is set
-   favicon is set
-   'THREE.WebGLRenderer 84' should be the only verbose/info log, warnings are ok, errors should not exist
