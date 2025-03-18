# Live Deployment

[Deployed on Vercel](https://studyconnect-deploy.vercel.app/).

# Running Locally

## Prerequisites
- Git version 2.43 or above (check using git -v)
- npm version 10.2 or above (check using npm -v)

## Installation

Clone the project: `git clone https://github.com/ucsb-cs148-w25/pj06-studyconnect.git`

Install dependencies: `npm install`

Create a .env.local file in the /study-connect folder with the following environmental variables:

NEXT_PUBLIC_FIREBASE_API_KEY="<your_key>"

NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="<your_key>"

NEXT_PUBLIC_FIREBASE_PROJECT_ID="<your_key>"

NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="<your_key>"

NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="<your_key>"

NEXT_PUBLIC_FIREBASE_APP_ID="<your_key>"

NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="<your_key>"

UCSB_API_KEY="<your_key>"

FIREBASE_CLIENT_EMAIL="<your_key>"

FIREBASE_PRIVATE_KEY="<your_key>"

CLOUDINARY_URL="<your_key>"

- You can get the Firebase keys by making a Firebase account and creating a new project here: [Firebase](https://firebase.google.com/).
- You can get a UCSB API key by filling out a request form here: [UCSB API request form](https://developer.ucsb.edu/docs/applications/application-approval-request).
- You can get a cloudinary key by making a free Cloudinary account here [Cloudinary](https://cloudinary.com/).

Run locally: `npm run dev`

Visit site at localhost:3000

