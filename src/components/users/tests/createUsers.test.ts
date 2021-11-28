import { expect } from 'chai'
import { beforeEach, describe, test } from 'mocha'
import { orma_introspect, orma_mutate } from 'orma'
import env from '../../../../env.json'
import { initDb } from '../../../configs/migrations'
import { pool_query } from '../../../configs/mysql'
import { createUsers } from '../createUsers'
import users from './accounts-api.json'

describe('createUsers', () => {
    beforeEach(async () => await initDb())
    test(orma_mutate.name, async () => {
        const orma_schema = await orma_introspect(env.database, pool_query)

        const usersDeduped = users.filter(
            (el, i) =>
                !users
                    .slice(0, i)
                    .map(el => el.email)
                    .includes(el.email)
        )

        const results = await createUsers(usersDeduped, orma_schema)

        expect(results.users.length).to.equal(20)
    })
})
