describe('choosing metrics', () => {

    it('all three metrics are immediately accessible and set to default values', () => {
        cy.visitCC();
        cy.getAreaMetricSelection().should('contain', "rloc");
        cy.getHeightMetricSelection().should('contain', "mcc");
        cy.getColorMetricSelection().should('contain', "mcc");
    })

    it('metrics should contain unary metric', () => {
        cy.visitCC();
        cy.getAreaMetricSelection().click();
        cy.get("md-select-menu").should("contain", "unary");
    })

    it('metrics should contain default metrics', () => {
        cy.visitCC();
        cy.getAreaMetricSelection().click();
        cy.get("md-select-menu").should("contain", "rloc");
        cy.get("md-select-menu").should("contain", "mcc");
        cy.get("md-select-menu").should("contain", "functions");
    })

    it('changing area metric should update the area metric in details', () => {
        cy.visitCC();
        cy.getAreaMetricSelection().click();
        cy.get(".md-select-menu-container.md-active md-option:nth-of-type(1)").click();
        cy.get("canvas").click(500,500);
        cy.getAreaMetricTextInDetailPanel().should("contain", "functions");
    })


    it('changing height metric should update the height metric in details', () => {
        cy.visitCC();
        cy.getHeightMetricSelection().click();
        cy.get(".md-select-menu-container.md-active md-option:nth-of-type(1)").click();
        cy.get("canvas").click(500,500);
        cy.getHeightMetricTextInDetailPanel().should("contain", "functions");
    })

    it('changing color metric should update the color metric in details', () => {
        cy.visitCC();
        cy.getColorMetricSelection().click();
        cy.get(".md-select-menu-container.md-active md-option:nth-of-type(1)").click();
        cy.get("canvas").click(500,500);
        cy.getColorMetricTextInDetailPanel().should("contain", "functions");
    })


})