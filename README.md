# Northcoders News API

The hosted version of this directory can be found at: https://v2-nc-news-backend-project-northcoders.onrender.com/api

This project is my first hosted back-end project, which culminates the back-end part of my course at NorthCoders. The project hosts a database containing information about articles and comments on articles on a range of topics, by a range of authors.

## Local Backend Setup

Ensure you have the following installed: 

- **[Node.js](https://nodejs.org/)** (minimum version: 21.6.2)
- **[PostgreSQL](https://www.postgresql.org/download/)** (minimum version:  8.7.3)

### 1. Clone the Repository

Begin by cloning the repository to your local machine. Use the following command in your terminal, ensuring you navigate to your desired directory:

```bash
git clone https://github.com/Clatherine/be-nc-news-.git
```

### 2. Install Dependencies

Next, install the project dependencies using npm. Execute the following command in your terminal (ensure you're within the repository directory):

```bash
npm install
```

This command will fetch and install the required packages.


#### 3. Create Environment Variable Files

You will need to make a .env.development and a .env.test file to connect to your test and development databases locally.

Within these, type:
- for .env.development: 'PGDATABASE=db_name'
- for .env.test: 'PGDATABASE=db_name_test'

#### 4. Set-Up and Seed the Databases
Set up the local databases:
```bash
npm run setup-dbs
```
Seed the development database:
```bash
npm run seed
```
Run the API tests:
```bash
npm run integration-test.js
```
or 
```bash
npm t int
```
To run both the integration-test file AND the utils.test file, run:
```bash
npm t
```

#### 5. See app in action
Finally, to see the front-end app in action, follow these links:
- App: https://hot-off-the-press-news.netlify.app/
- GitHub: https://github.com/Clatherine/nc-news

This portfolio project was created as part of a Digital Skills Bootcamp in Software Development provided by [Northcoders](https://northcoders.com/)
