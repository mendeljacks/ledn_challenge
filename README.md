# Overview
Aight today we're gonna build a simple transaction ledger.

The goal is to demonstrate a simple crud api.
I'll be using express, node.js and mysql cause
that's what I'm comfortable with, however the storage mechanism will be abstracted so that in future this systm can use a different database should the need arise.

# Scope
From the business specs, there are only two entities: accounts and transactions, which are related 1:many. 

- Typically JWT authentication could be used, but to begin let's assume only admin users use internally so I will not be implementing roles/perms/signup/signin.
- I will assume performance matters minimise copying and support batch queries however will not implement materialised views for the aggregations. If performance is critical additional gains can be achieved with prepared statements, pre-compiled checking functions such as ajv or even faster languages such as rust.

I will achieve retrieving accounts, retrieving account balances, debiting, crediting and transfering between accounts using the following routes:

1. POST /users Creates Users in batch

2. Query route for get account with its balance
3. Mutation route for Debits/Credits/Transfers

What I will include: 
- validation to prevent user error
- tests to prevent programmer error
- types to make future maintainance a breeze 

Extra features such as rate limits or token expiry can be added if requested.
no env, ci/cd and hosting  

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
