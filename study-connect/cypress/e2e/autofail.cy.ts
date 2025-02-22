cy.session

describe('Loads homepage', () => {
  it('Visits the homepage and ensures description appears', () =>{
    cy.visit('http://localhost:3000')

    cy.contains('Welcome to Study Connect')
    cy.contains('Connect with fellow UCSB students, form study groups, and excel together in your academic journey.')

    cy.contains('StudyConnect').click()
    cy.url().should('include', '/')
  })
})


describe('Clicking Login Opens Prompt', () => {
  it('Clicks the login button and opens login prompt', () => {
    cy.visit('http://localhost:3000')
    cy.contains('Sign in with Google').click()
    cy.contains('Sign Out')
  })
})

describe('Clicks Profile', () => {
  it('Clicks on the Profile navbar link and goes to the profile page', () => {
    cy.visit('http://localhost:3000')
    cy.contains('Profile').click()

    cy.url().should('include', '/profile')
  })
})

describe('Clicks Edit Profile', () => {
  it('Clicks on the Edit Profile button and goes to edit profile page', () => {
    cy.visit('http://localhost:3000/profile')
    cy.contains('Edit Profile').click()

    cy.url().should('include', '/edit') 
  })
})

describe('Logs out of Google', () => {
  it('Clicks the logout button and logs out of google', () => {
    cy.visit('http://localhost:3000')
    cy.contains('Sign Out').click()

    cy.url().should('include', '/')
  })
})
