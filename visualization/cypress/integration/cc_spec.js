describe('My First Test', function() {
    it('finds the content "type"', function() {
        cy.visit("dist/webpack/index.html")
        cy.contains('type')
    })
})