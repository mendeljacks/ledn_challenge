# Overview
Aight today we're gonna build a simple transaction ledger.

The goal is to demonstrate a simple crud api.
I'll be using express, node.js and mysql. 

# Scope
From the business specs, there are only two entities: accounts and transactions, which have a one to many relationship. 

- Typically JWT authentication could be used, but to begin let's imagine our adminswill not be needing  roles/perms/signup/signin just yet.
- Performance will start to matter so I will batch queries and minimise copying however will not implement materialised views for the aggregated balance. Additional gains can be achieved with prepared statements, pre-compiled validation functions (ajv) or dropping down to rust.

What I will include: 
- Query users/transactions
- Mutate users/transactions
- Validation
- Tests to prevent programmer error
- Types to make future maintainance a breeze 
- Examples (see examples.http)

What I will not include:
- Rate limits
- Jwt/bcrypt
- Env management
- Ci/cd
- Logging
- Hosting  

# Getting started

With docker installed run
```
docker run -p 3306:3306 --name mydb -e MYSQL_ROOT_PASSWORD=test -d mysql:latest
```
With nodeJS installed run
```
npm install
npm start
```
Try the examples in examples.http or run npm test