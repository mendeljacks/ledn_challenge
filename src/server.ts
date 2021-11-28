import cors from 'cors'
import express from 'express'
import { orma_introspect, orma_query } from 'orma'
import env from '../env.json'
import { login } from './components/login'
import { createUsers } from './components/users/createUsers'
import { pool_query } from './configs/mysql'
import { handler } from './helpers/handler'

const start_server = async port => {
    const app = express()
    const orma_schema = await orma_introspect(env.database, pool_query)

    app.use(cors())
    app.use(express.json())

    app.get(
        '/login',
        handler((req, res) => login(req.query.username, req.query.password))
    )

    app.post(
        '/query',
        handler(async (req, res) => orma_query(req.body, orma_schema, pool_query))
    )

    app.post(
        '/mutate',
        handler(async (req, res) => createUsers(req.body.users, orma_schema))
    )

    await new Promise(r => app.listen(port, r as any))
    console.log(`🚀 Listening at http://localhost:${port}`)
}

start_server(process.env.PORT || 9999)
