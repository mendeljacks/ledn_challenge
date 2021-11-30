import { expect } from 'chai'
import { beforeEach, describe, test } from 'mocha'
import { orma_introspect } from 'orma/build/introspector/introspector'
import env from '../../env.json'
import { initDb } from '../configs/migrations'
import { poolQuery } from '../configs/mysql'
import { cast } from '../helpers/cast'

describe('Cast', () => {
    beforeEach(async () => await initDb())
    test('Casts dates', async () => {
        const ormaSchema = await orma_introspect(env.database, poolQuery)

        const body = {
            users: [{
                createdAt: '2020-01-01',
                transactions: [{ createdAt: '2020-01-01' }]
            }]
        }

        const casted = cast(body, ormaSchema, true)

        expect(casted.users[0].createdAt instanceof Date).to.equal(true)
        expect(casted.users[0].transactions[0].createdAt instanceof Date).to.equal(true)
    })
})