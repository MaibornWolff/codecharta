Cypress.Commands.add("visitCC", () => cy.visit("dist/webpack/index.html"));

Cypress.Commands.add("getAngular",
    () => {
        return cy.window().its('angular');
    }
);

Cypress.Commands.add("getScope",
    (selector) => {
        return cy.get(selector).then($el => cy.getAngular().then(ng => ng.element($el).scope()));
    }
);

Cypress.Commands.add("getInjector",
    (selector) => {
        return cy.get(selector).then($el => cy.getAngular().then(ng => ng.element($el).injector()));
    }
);

Cypress.Commands.add("openExperimentalTab", () => {
    cy.get('[md-component-id="_expansion_panel_id_18"] > md-expansion-panel-collapsed').click({force:true});
});

Cypress.Commands.add("openMenu", () => {
    cy.get('[aria-label="Open Sidenav"]').click();
});

Cypress.Commands.add("getAreaMetricSelection", () => {
    return cy.get('horizontal-metric-chooser-component > :nth-child(1) md-select');
});

Cypress.Commands.add("getAreaMetricTextInDetailPanel", () => {
    return cy.get('detail-panel-component tbody > :nth-child(2) > :nth-child(2)');
});

Cypress.Commands.add("getHeightMetricSelection", () => {
    return cy.get('horizontal-metric-chooser-component > :nth-child(2) md-select');
});

Cypress.Commands.add("getHeightMetricTextInDetailPanel", () => {
    return cy.get('detail-panel-component tbody > :nth-child(3) > :nth-child(2)');
});

Cypress.Commands.add("getColorMetricSelection", () => {
    return cy.get('horizontal-metric-chooser-component > :nth-child(3) md-select');
});

Cypress.Commands.add("getColorMetricTextInDetailPanel", () => {
    return cy.get('detail-panel-component tbody > :nth-child(4) > :nth-child(2)');
});

