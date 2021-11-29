import { expect } from 'chai'
import { beforeEach, describe, test } from 'mocha'
import { orma_introspect, orma_mutate, orma_query } from 'orma'
import env from '../../../env.json'
import { initDb } from '../../configs/migrations'
import { mysql, poolQuery } from '../../configs/mysql'
import { mutateHandler } from '../../api/mutateHandler'
import users from './accounts-api.json'

describe('Get user', () => {
    beforeEach(async () => await initDb())
    test(orma_mutate.name, async () => {
        const ormaSchema = await orma_introspect(env.database, poolQuery)
        await mutateHandler({ $operation: 'create', users }, ormaSchema)

        const results: any = await orma_query(
            {
                users: {
                    id: true,
                    email: true,
                    $where: {
                        $eq: ['email', '"Cassandre10@gmail.com"']
                    }
                }
            },
            ormaSchema,
            poolQuery,
            mysql.escape
        )
        

        expect(results.users.length).to.equal(1)
    })
})
