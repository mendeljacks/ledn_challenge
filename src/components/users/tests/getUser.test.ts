import { expect } from 'chai'
import { beforeEach, describe, test } from 'mocha'
import { orma_introspect, orma_mutate, orma_query } from 'orma'
import env from '../../../../env.json'
import { initDb } from '../../../configs/migrations'
import { pool_query } from '../../../configs/mysql'
import { createUsers } from '../createUsers'
import users from './accounts-api.json'

describe('Get user', () => {
    beforeEach(async () => await initDb())
    test.skip(orma_mutate.name, async () => {
        const orma_schema = await orma_introspect(env.database, pool_query)
        const results = await createUsers(users, orma_schema)

        const user = await orma_query(
            {
                users: {
                    id: true,
                    email: true,
                    $where: {
                        $eq: ['email', 'Cassandre10@gmail.com']
                    }
                }
            },
            orma_schema,
            pool_query
        )

        expect(results.users.length).to.equal(20)
    })
})
