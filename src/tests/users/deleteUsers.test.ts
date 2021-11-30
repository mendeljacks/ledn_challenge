import { expect } from 'chai'
import { beforeEach, describe, test } from 'mocha'
import { orma_introspect, orma_mutate } from 'orma'
import env from '../../../env.json'
import { initDb } from '../../configs/migrations'
import { poolQuery } from '../../configs/mysql'
import { dedup } from '../../helpers/dedup'
import { validate } from '../../schemas/schema'
import { mutateHandler } from '../../api/mutateHandler'
import users from './accounts-api.json'

describe('deleteUsers', () => {
    beforeEach(async () => {
        await initDb()
        const ormaSchema = await orma_introspect(env.database, poolQuery)
        const results = await mutateHandler({ $operation: 'create', users }, ormaSchema)
    })
    test('Delete a user', async () => {
        const ormaSchema = await orma_introspect(env.database, poolQuery)
        const body = { $operation: 'delete', users: [{ email: 'Cassandre10@gmail.com' }] }

        const result = await mutateHandler(body, ormaSchema)
        expect(result.users.length).to.equal(1)
    })
    test('Can validate a delete request', () => {
        const data = { $operation: 'delete', users: [{ email: 'mendeljack@gmail.com' }] }

        const errors = validate(data)
        expect(errors.length).to.equal(0)
    })
    test('No missing unique identifier', () => {
        const data = { $operation: 'delete', users: [{ firstName: 'Mendel' }] }

        const errors = validate(data)
        expect(errors.length).to.equal(4)
    })
})
