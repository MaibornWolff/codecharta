describe('layout switching', () => {

    it('all three metrics are immediately accessible and set to default values', () => {
        cy.visitCC();
        cy.get('h1 > .ng-binding').should('contain', "CodeCharta");
        cy.openMenu();
        cy.openExperimentalTab();
        cy.get('#radio_48').click({force: true});
        cy.get('h1 > .ng-binding').should('contain', "TestVille");
    })

})