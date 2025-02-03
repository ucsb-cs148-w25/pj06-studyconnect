# pj06-studyconnect

Project Description: A webapp that helps connect college students in the same classes together for studying.

Full Name: Github ID
----------------------
Zhenyu Yu: ZhenyuYu1  
Wesley Chiba: jeffsmithepic  
Maria Saucedo-Flores: Maria-Saucedo  
Shelly Zhu: zhushelly  
Allen Hu: AllenHsm  
Anthony Jin: jinanthony  
Hannah Su: hannuhsu

# Tech Stack

Main Framework: Next.js

Backend:
- Database: Firebase
- Authentication: Firebase / Google OAuth
- Fetching UCSB class info: UCSB API

Deployment: Vercel

# Idea

In the front page of the website, each user is prompted with a Firebase or Google OAuth login for authentication. If login is successful, the webapp will display a list of classes that each user can choose from. The user can filter for a specific class by name or major, and can join each class. Students that join a class can send discussion messages in a chat room where they can connect with other students and share study resources. We are planning to use Firebase for storing user data, Firebase / Google OAuth for authentication, and the UCSB API to fetch class info.

# Roles

- Student:
  - Goal: To connect with other students and help study for classes
  - Permissions: View & browse classes, post messages and discussions
- Instructor:
  - Goal: To facilitate discussion about classes and help students study
  - Permissions: Pin discussion posts to channel, remove irrelevant content from chats
 - Administrator:
   - Goal: To ensure class chats are not being misused (remove spam bots, etc)
   - Permissions: Remove users from channel, remove irrelevant content
  
# Installation

### Prerequisites
- Git version 2.43 or above (check using git -v)  
- npm version 10.2 or above (check using npm -v)  

### Dependencies
Frontend: 
- React.js and Next.js
- Tailwind for styling

Backend:
- Database: Firebase
- Authentication: Firebase / Google OAuth

### Installation Steps
Clone the project: git clone https://github.com/ucsb-cs148-w25/pj06-studyconnect.git  
Install dependencies: npm install  
Run locally: npm run dev  
Visit site at [localhost:3000](http://localhost:3000/)

# Functionality
1. Login using your @ucsb.edu email and fill out your profile page.
2. View courses in the courses page found on the right side of the header
3. Search courses by subject code or course name

# Known Problems
1. Saving profile details (name, year, major) not yet implemented
2. Saving selected courses not yet implemented

# Contributing
1. Fork it!
2. Create your feature branch: git checkout -b my-new-feature
3. Commit your changes: git commit -am 'Add some feature'
4. Push to the branch: git push origin my-new-feature
5. Submit a pull request :D
