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

describe('createUsers', () => {
    beforeEach(async () => await initDb())
    test(orma_mutate.name, async () => {
        const ormaSchema = await orma_introspect(env.database, poolQuery)

        const usersDeduped = dedup(el => el.email, users)

        const results = await mutateHandler(
            { $operation: 'create', users: usersDeduped },
            ormaSchema
        )

        expect(results.users.length).to.equal(20)
    })
    test('Can validate a create request', () => {
        const data = {
            $operation: 'create',
            users: [
                {
                    firstName: 'Mendel',
                    lastName: 'Jacks',
                    country: 'AR',
                    email: 'mendeljack@gmail.com',
                    dob: '1996-08-11T12:00:00Z',
                    createdAt: '2019-08-11T12:00:00Z',
                    updatedAt: '2019-08-11T12:00:00Z'
                }
            ]
        }

        const errors = validate(data)
        expect(errors.length).to.equal(0)
    })
    test('No missing props validation', () => {
        const data = {
            $operation: 'create',
            users: [
                {
                    // firstName: 'Mendel',
                    lastName: 'Jacks',
                    country: 'AR',
                    email: 'mendeljack@gmail.com',
                    dob: '1996-08-11T12:00:00Z',
                    createdAt: '2019-08-11T12:00:00Z',
                    updatedAt: '2019-08-11T12:00:00Z'
                }
            ]
        }

        const errors = validate(data)
        expect(errors.length).to.equal(2)
    })
    test('Validation allows nested users', () => {
        const data = {
            $operation: 'create',
            users: [
                {
                    firstName: 'Mendel',
                    lastName: 'Jacks',
                    country: 'AR',
                    email: 'mendeljack@gmail.com',
                    dob: '1996-08-11T12:00:00Z',
                    createdAt: '2019-08-11T12:00:00Z',
                    updatedAt: '2019-08-11T12:00:00Z',
                    transactions: [
                        {
                            type: 'send',
                            amount: -123,
                            createdAt: '2019-08-11T12:00:00Z'
                        }
                    ]
                }
            ]
        }

        const errors = validate(data)
        expect(errors.length).to.equal(0)
    })
})
