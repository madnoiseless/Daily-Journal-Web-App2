# Daily-Journal-Web-App2

This is a web application built using Node.js, Express, and MongoDB. The project aims to provide a platform for users to create, edit, and delete journal entries. The application uses EJS for templating and body-parser for handling form data.

## Getting Started

To get started with the project, follow these steps:

1. Install the required dependencies by running the following command in your terminal:
```bash
npm install
```
1. Set up a MongoDB database by running `mongod` in your terminal.
2. Update the MongoDB connection string in `app.js` to match your local setup.
3. Start the server by running the following command in your terminal:
```bash
node app.js
```
The server will start running on port 3000. You can access the application through your browser at `http://localhost:3000`.

## Features

* Home page with a starting content and a list of journal entries.
* About page with static content.
* Contact page with static content.
* A form to compose new journal entries.
* Maintenance page to view, edit, and delete journal entries.

## Limitations

The project has a self-imposed limit of 10 journal entries to prevent excessive content in this demo.

## Endpoints

* `GET /` - Displays the home page with a list of journal entries.
* `GET /about` - Displays the about page.
* `GET /contact` - Displays the contact page.
* `GET /compose` - Displays the form to compose new journal entries.
* `POST /compose` - Saves a new journal entry to the database.
* `GET /posts/:postId` - Displays a specific journal entry.
* `GET /maintenance` - Displays the maintenance page with a list of journal entries.
* `POST /edit` - Opens the form to edit a specific journal entry.
* `POST /editSave` - Saves the changes to a specific journal entry.
* `POST /delete` - Deletes a specific journal entry.

## Technologies Used

* Node.js
* Express
* MongoDB
* EJS (Embedded JavaScript Templates)
* Body-parser
* Lodash

Feel free to contribute to this project and improve its functionality. Don't forget to follow best practices and write clean, well-documented code.
