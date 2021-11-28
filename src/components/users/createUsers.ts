import { nanoid } from 'nanoid'
import { orma_mutate } from 'orma'
import { escape, mysql, pool_mutate } from '../../configs/mysql'
import { snakeKeys } from '../../helpers/snakeCase'
import { User } from './types'
import { userSchema } from './validation'

export const createUsers = async (users: User[], orma_schema) => {
    const { value, error } = userSchema.validate(users, { abortEarly: false })
    if (error) return Promise.reject(error)

    const mutation = {
        $operation: 'create',
        users: value.map(el => ({ ...snakeKeys(el), resource_id: nanoid() }))
    }

    const results = await orma_mutate(mutation, pool_mutate, el => mysql.escape(el), orma_schema)

    return results
}
