## Unit Tests Implementation

Testing Suite Used: Jest 

https://nextjs.org/docs/app/building-your-application/testing/jest

Tests were created for the Class Forums and Explore Courses pages. 

### Class Forum Tests

Jest was used to make mocks of a post on a class forum, and the following tests were created:
1. Renders ClassForum Componenet: checks that the class forum appears
2. Displays post: checks that a post made will appear when fetch is successful
3. Displays error message: checks that correct error message appears when fetch is unsuccessful
4. Checks that posts are created correctly: uses the mock posts to check that posts are properly created and displayed
5. Displays error message: checks that correct error message appears when post is not created successfully.

### Explore Courses Tests

Jest was used to make a mock course TEST123 and mock functions for the firebase, and the following test was created:
1. Check that the ExploreClasses components render

## Decision Regarding Unit Testing Going Forward

Our team has decided not to continue unit testing going forward with this project. While these tests would be useful for a long term project where extensive refactoring and constant new updates were being made, we have to acknowledge that this course only takes place over the span of 10 weeks, with much of that time already being taken up by overhead tasks such as the homeworks, learning new material and codebases, experimenting with AI and having to repurpose the code to ensure it's functional, etc. It is the end of Week 7 now and the app still does not contain functionality in all of it's base features, with the more complex features being made in chunks. It would simply take up too much of the group's time and effort to write production code, and then have to halt progress to write unit tests that could be easily tested locally by just running npm run dev and going and visually seeing the changes and functionality run, with the added benefit of being able to see what action directly causes an error to pop up. 

## End-To-End Tests Implementation

Testing Suite Used: Cypress 

https://www.cypress.io/

Tests were created for the functionality of navigating through the website and rendering pages.

### "renderhomepage" Spec: Renders Homepage Test, StudyConnect link Test

The first testing spec made with Cypress was a simple test that opens the Homepage and searches for:
1. The Welcome message
2. The description provided under the welcome message
3. The StudyConnect logo on the navbar
   
    i. It then tests that the StudyConnect logo is clickable, and that when it is clicked, it updates the url to be `[url]/`

### "autofail" Spec: Render Profile and Profile Edit Test, Login/Logout Button Test

The second testing spec was an attempt to get familiar with Cypress' other tests, but unfortunately due to our sign-in method for the app using Google OAuth, UCSB SSO, and the 2FA application DuoMobile, it was difficult to attempt to simulate a sign-in so that the links to the Profile and Courses pages would load. 

In my experimenting, I was able to get around the issue by letting all the tests run through and fail purposefully, manually signing in once the tests stopped reloading the local deployment, and then hitting the button to run the test again and ensure they all pass.

Doing this, the tests implemented were:
1. Check the the google sign in button is rendered
2. Press the button to log in
3. Check state is logged in by searching for the now-rendered logout button
4. Once logged in, look for rendered Profile link in navbar
   
   i. Assert that once Profile is clicked on, the url now contains '/profile'
5. Once on /profile, check that "Edit Profile" button exists and click on it
   
   i. Assert that once Edit Profile is clicked on, the url now contains '/edit'

## Decision Regarding End-To-End Testing Going Forward

Our team has decided to not continue high level testing going forward. While Cypress is much quicker to pick up than Jest was, the issues surrounding the method we chose for logging in, and the amount of work it would take to get around that SSO 2FA just make it not worth keeping. It took hours of research and documentation reading to figure out how to give Cypress access to the Google OAuth API with environmental variables and the developer playground, and due to the added security for UCSB students, it didn't even work in the end and had to be scrapped.

While yes, the tests will work if we let them all fail and then log in ourselves, this removes the benefit of "automation" that comes from the these kinds of tests, and with having to log in on our own, we once again arrive at the same issue with the Unit Tests. It would simply just be easier to literally go in ourselves and click around until we find errors. Since we're requiring 2 approvals before a PR can be merged, chances are at least one of the 3 people looking at the code and messing around with the deployment are going to find any major bugs regardless. 

## Conclusions

While it was interesting to experiment with these testing suites and they certainly have their benefits, given the short development linespan of this project and the current workload, our group has decided to apply the Agile Manifesto: Individuals and interactions over processes and tools. There's not enough time to get everyone in the team acquainted with these libraries, and adding them in would only serve to confuse people further. Instead, careful and thorough PR reviews as well as in-person communication will be how we keep our code functional and bug-free going forward.





