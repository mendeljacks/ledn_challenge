// get the client
import mysqlPromise from 'mysql2/promise'

// Create the connection pool. The pool-specific settings are the defaults
export const mysql = mysqlPromise.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'test',
    multipleStatements: true,
})