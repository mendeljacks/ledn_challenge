# Overview
Hi there, today we're gonna build a simple transaction ledger.

The goal is to demonstrate a crud api using a javascript stack.
I'll be using express, node.js and mysql. 

# Scope
Business specs call for two entities: accounts and transactions, which will have a one to many relationship. 
Our admin is very busy creating 100k+ records so we will ensure the api is buttery smooth.

I will be using my experimental orm called orma to batch queries and provide a declarative syntax for queries and mutations. 
From my testing this is fast enough, however if speed was critical, I'd consider a materialised view instead of balance aggregation on the fly. Additional gains are possible with prepared statements, or dropping down to rust but would take more time to implement.

What I will include: 
- CRUD for users
- CRUD for transactions
- Aggregation query into users balances
- Validation using ajv
- Tests using mocha
- Typescript types for intellisense 
- Interactive Examples (see examples.http)

What I will not include:
- Rate limiting
- Authentication jwt/bcrypt
- Env files
- logging   
- ci/cd/hosting

# Getting started

Have a mysql on port 3306 with a password of test
```
docker run -p 3306:3306 --name mydb -e MYSQL_ROOT_PASSWORD=test -d mysql:latest
```

Run the project locally
```
npm install

// Test the examples with VSCode Rest Client Extension or Postman
npm start 

// Tests (require database to be online) 
npm test 
```