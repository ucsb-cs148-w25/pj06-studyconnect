describe('Loads homepage', () => {
  it('Visits the homepage and ensures description appears', () =>{
    cy.visit('http://localhost:3000')

    cy.contains('Welcome to Study Connect')
    cy.contains('Connect with fellow UCSB students, form study groups, and excel together in your academic journey.')

    cy.contains('StudyConnect').click()
    cy.url().should('include', '/')
  })
})