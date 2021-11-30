import cors from 'cors'
import express from 'express'
import { orma_introspect, orma_query } from 'orma'
import env from '../../env.json'
import { mysql, poolQuery } from '../configs/mysql'
import { handler } from '../helpers/handler'
import { mutateHandler } from './mutateHandler'

const start_server = async port => {
    const app = express()
    const ormaSchema = await orma_introspect(env.database, poolQuery)

    app.use(cors())
    app.use(express.json())

    app.post(
        '/query',
        handler(async (req, res) => orma_query(req.body, ormaSchema, poolQuery))
    )

    app.post(
        '/mutate',
        handler(async (req, res) => mutateHandler(req.body, ormaSchema))
    )

    await new Promise(r => app.listen(port, r as any))
    console.log(`🚀 Listening at http://localhost:${port}`)
}

start_server(process.env.PORT || 3000)
