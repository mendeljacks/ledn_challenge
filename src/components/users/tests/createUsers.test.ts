import { createUsers } from '../createUsers'
import { beforeEach, describe, test } from 'mocha'
import { expect } from 'chai'
import { initDb } from '../../../configs/migrations'
import fs from 'fs'
import users from './accounts-api.json'
// import users from './accounts-api-large.json'

beforeEach(async () => {
    await initDb()
})
describe('createUsers', () => {
    test(createUsers.name, async () => {
        const results = await createUsers(
            users
                .filter(
                    (el, i) =>
                        !users
                            .slice(0, i)
                            .map(el => el.email)
                            .includes(el.email)
                )
                .map(el => ({ ...el, referredBy: null }))
        )
        expect(results[0].affectedRows).to.equal(20)
    })
})
