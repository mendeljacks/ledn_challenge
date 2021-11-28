import { nanoid } from 'nanoid'
import { orma_mutate } from 'orma'
import { mysql, pool_mutate } from '../../configs/mysql'
import { snakeKeys } from '../../helpers/snakeCase'
import { Transaction } from './types'
import { transactionSchema } from './validation'

export const createTransactions = async (transactions: Transaction[], orma_schema) => {
    const { value, error } = transactionSchema.validate(transactions, { abortEarly: false })
    if (error) return Promise.reject(error)

    const mutation = {
        $operation: 'create',
        transactions: value.map(el => ({ ...snakeKeys(el), resource_id: nanoid() }))
    }

    const results = await orma_mutate(mutation, pool_mutate, el => mysql.escape(el), orma_schema)
    
    return results
}
