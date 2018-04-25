describe('initial CC state', () => {

    it('finds the current version number', () => {
        cy.visitCC();
        cy.get('h1 > .ng-binding').should('contain', require("../../package.json").version);
    })

})