import { nanoid } from 'nanoid'
import { orma_mutate } from 'orma'
import { mysql, poolMutate } from '../configs/mysql'
import { cast } from '../helpers/cast'
import { validate } from '../schemas/schema'

export const mutateHandler = async (body, ormaSchema) => {
    // Validate the body
    const errors = validate(body)
    if (errors.length) return Promise.reject(errors.map(err => err))
    
    // Cast the dates and add resourceIds
    const mutation = cast(body, ormaSchema, body['$operation'] === 'create')
    
    // Perform the mutation
    const results = await orma_mutate(mutation, poolMutate, el => mysql.escape(el), ormaSchema)

    return results
}
