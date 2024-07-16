# Northcoders News API

The hosted version of this directory can be found at: https://v2-nc-news-backend-project-northcoders.onrender.com/api

This project is my first hosted back-end project, which culminates the back-end part of my course at NorthCoders. The project hosts a database containing information about articles and comments on articles on a range of topics, by a range of authors.

To clone this repo, please clone it using git clone.

Before you start:
1. You will need to install the following:

devDependencies: 
    - jest
    - jest-extended
    - supertest

dependencies:
    - dotenv
    - express
    - i
    - jest-sorted
    - pg
    - pg-format
    - husky

These should all be on the package.json file, so you just need to run 'npm install -i'

Note you will need to have Node.js installed to run the project, minimum v21.6.2.

You will need Postgres min version 8.7.3

2. You will need to make a .env.development and a .env.test file to connect to your test and development databases locally.

Within these, type:
- for .env.development: 'PGDATABASE=db_name'
- for .env.test: 'PGDATABASE=db_name_test'

3. You will need to set up your local databases using 'npm run setup-dbs' 

/* note I'm not sure if this needs to be done or if we are assuming the developer already has databases set up? */

4. You will need to seed your local development database using 'npm run seed'. Note the integration-test file seeds the test database before each test block when it is run.

5. To run tests on the test database, use 'npm run test integration-test.js', or simply 'npm t int'. Note 'npm t' will run both the integration-test file AND the utils.test file.

--- 

This portfolio project was created as part of a Digital Skills Bootcamp in Software Development provided by [Northcoders](https://northcoders.com/)
