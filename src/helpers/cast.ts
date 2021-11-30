import { nanoid } from 'nanoid'
import { get_all_edges } from 'orma/build/helpers/schema_helpers'

// Casting is used because mysql doesn't like the milliseconds in a timestamp
// We also add unique id for batching purposes (mysqsl doesn't do returning * like postgres)
export const cast = (body, ormaSchema, addResourceIds: boolean) => {
    const presentEntities = Object.keys(body).filter(el => Object.keys(ormaSchema).includes(el))
    presentEntities.forEach(entity => {
        body[entity] = body[entity].map(record => {
            const dateColNames = Object.keys(ormaSchema[entity]).filter(
                el => ormaSchema[entity][el].data_type === 'date'
            )
            const foreignEntityNames = get_all_edges(entity, ormaSchema).map(el => el.to_entity)
            const keys = Object.keys(record)
            const dateKeys = keys.filter(el => dateColNames.includes(el))
            const entityKeys = keys.filter(el => foreignEntityNames.includes(el))
            const primitiveKeys = keys.filter(
                el => !dateKeys.includes(el) && !entityKeys.includes(el)
            )

            let output = {
                ...dateKeys.reduce(
                    (acc, dateKey) => ({ ...acc, [dateKey]: new Date(record[dateKey]) }),
                    {}
                ),
                ...primitiveKeys.reduce(
                    (acc, primitiveKey) => ({ ...acc, [primitiveKey]: record[primitiveKey] }),
                    {}
                ),
                ...entityKeys.reduce(
                    (acc, entityKey) => ({
                        ...acc,
                        ...cast({ [entityKey]: record[entityKey] }, ormaSchema, addResourceIds)
                    }),
                    {}
                ),
                ...(addResourceIds && { resourceId: nanoid() })
            }

            return output
        })
    })

    return body
}
