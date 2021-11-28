import { expect } from 'chai'
import { beforeEach, describe, test } from 'mocha'
import { orma_introspect, orma_mutate, orma_query } from 'orma'
import env from '../../../../env.json'
import { initDb } from '../../../configs/migrations'
import { pool_query } from '../../../configs/mysql'
import { createUsers } from '../../users/createUsers'
import { createTransactions } from '../createTransactions'
// import transactions from './transactions-api.json'
import transactions from './transactions-api-large.json'
import users from '../../users/tests/accounts-api-large.json'
import { Transaction } from '../types'
import { key_by } from '../../../helpers/key_by'

describe('createTransactions', () => {
    beforeEach(async () => {
        await initDb()
        const orma_schema = await orma_introspect(env.database, pool_query)
        const usersDeduped = users.filter((el, i) => {
            return !users
                .slice(0, i)
                .map(el => el.email)
                .includes(el.email)
        })
        await createUsers(usersDeduped, orma_schema)
    })
    test(orma_mutate.name, async () => {
        const orma_schema = await orma_introspect(env.database, pool_query)

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
            orma_schema,
            pool_query
        )
        const userIdByEmail = key_by(el => el.email)(usersResponse.users)

        const transactionsToCreate: Transaction[] = transactions.map(el => {
            const { userEmail, ...rest } = el
            return { ...rest, userId: userIdByEmail[el.userEmail].id } as Transaction
        })

        const results = await createTransactions(transactionsToCreate, orma_schema)

        expect(results.transactions.length).to.equal(94434)
    })
})
