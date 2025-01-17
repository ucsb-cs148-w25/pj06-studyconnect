# pj06-studyconnect

Project Description: A webapp that helps connect college students in the same classes together for studying.

Full Name: Github ID
----------------------
Zhenyu Yu: ZhenyuYu1 <br />
Wesley Chiba: jeffsmithepic <br />
Maria Saucedo-Flores: Maria-Saucedo <br />
Shelly Zhu: zhushelly <br />
Allen Hu: AllenHsm <br />
Anthony Jin: jinanthony <br />
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
