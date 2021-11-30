import { expect } from 'chai'
import { beforeEach, describe, test } from 'mocha'
import { orma_introspect, orma_mutate, orma_query } from 'orma'
import env from '../../../env.json'
import { initDb } from '../../configs/migrations'
import { mysql, poolQuery } from '../../configs/mysql'
import { dedup } from '../../helpers/dedup'
import { keyBy } from '../../helpers/keyBy'
import { validate } from '../../schemas/schema'
import { Transaction } from '../../schemas/types'
import { mutateHandler } from '../../api/mutateHandler'
// import transactions from './transactions-api.json'
import users from '../users/accounts-api-large.json'
import transactionsJson from './transactions-api-large.json'

describe('createTransactions', () => {
    beforeEach(async () => {
        await initDb()
        const ormaSchema = await orma_introspect(env.database, poolQuery)
        const usersDeduped = dedup(el => el.email, users)
        await mutateHandler({ $operation: 'create', users: usersDeduped }, ormaSchema)
    })
    test(orma_mutate.name, async () => {
        const ormaSchema = await orma_introspect(env.database, poolQuery)
        const transactions: any[] = transactionsJson as any
        const usersResponse: any = await orma_query(
            {
                users: {
                    id: true,
                    email: true,
                    $where: {
                        $in: ['email', transactions.map(el => el.userEmail).map(el => `'${el}'`)]
                    }
                }
            },
            ormaSchema,
            poolQuery,
        )
        const userIdByEmail = keyBy(el => el.email)(usersResponse.users)

        const transactionsToCreate: Transaction[] = transactions.map(el => {
            const { userEmail, ...rest } = el
            return { ...rest, userId: userIdByEmail[el.userEmail].id } as Transaction
        })

        const results = await mutateHandler(
            { $operation: 'create', transactions: transactionsToCreate },
            ormaSchema
        )

        expect(results.transactions.length).to.equal(94434)
    })
    test('Can credit an account', () => {
        const data = {
            $operation: 'create',
            transactions: [
                {
                    userId: 1,
                    type: 'send',
                    amount: 123,
                    createdAt: '2019-08-11T12:00:00Z'
                }
            ]
        }

        const errors = validate(data)
        expect(errors.length).to.equal(0)
    })
    test('Can debit an account', () => {
        const data = {
            $operation: 'create',
            transactions: [
                {
                    userId: 1,
                    type: 'send',
                    amount: -123,
                    createdAt: '2019-08-11T12:00:00Z'
                }
            ]
        }

        const errors = validate(data)
        expect(errors.length).to.equal(0)
    })
   
})
