Testing Suite Used: Jest 
https://nextjs.org/docs/app/building-your-application/testing/jest

Tests were created for the Class Forums and Explore Courses pages. 

**Class Forum Tests**
Jest was used to make mocks of a post on a class forum, and the following tests were created:
1. Renders ClassForum Componenet: checks that the class forum appears
2. Displays post: checks that a post made will appear when fetch is successful
3. Displays error message: checks that correct error message appears when fetch is unsuccessful
4. Checks that posts are created correctly: uses the mock posts to check that posts are properly created and displayed
5. Displays error message: checks that correct error message appears when post is not created successfully.

**Explore Courses Tests**
Jest was used to make a mock course TEST123 and mock functions for the firebase, and the following test was created:
1. Check that the ExploreClasses components render
