import mysqlPromise from 'mysql2'
import { mutate_fn, statements } from 'orma/build/mutate/mutate'
import env from '../../env.json'
import { keyBy } from '../helpers/keyBy'

export const mysql: any = mysqlPromise
    .createPool({
        host: env.host,
        port: env.port,
        user: env.user,
        password: env.password,
        database: env.database,
        timezone: 'Z',
        multipleStatements: true
    })
    .promise()

// Orma needs a function that takes multiple strings and returns multiple query results
export const poolQuery = async (sql_strings: string[]) => {
    await mysql.query('use db')
    const results = await mysql.query(sql_strings.join(';')) // Faster than promise.all for many queries
    const results_arr = sql_strings.length === 1 ? [results[0]] : results[0] // mysql2 only wraps when multiple queries are sent
    return results_arr as Record<string, unknown>[][]
}

// Orma will call this function when it has mutation queries to run in parallel
export const poolMutate: mutate_fn = async (statements: statements) => {
    const creates: statements = statements.filter(el => el.operation === 'create')
    if (creates.length > 0) {
        const sql_strings = creates.map(el => el.command_sql)

        const results = await poolQuery(sql_strings)

        const output = await Promise.all(
            creates.map(async el => {
                const column_names = el.command_json.$insert_into[1]
                const resourceIdPosition = column_names.findIndex(el => el === 'resourceId')
                const resourceIdsEscaped = el.command_json_escaped.$values.map(
                    el => el[resourceIdPosition]
                )

                const rows = await fetchRowsByResourceId(el.entity_name, resourceIdsEscaped)

                const pks = keyBy(el => el.resourceId)(rows)

                return el.paths.map((path, i) => {
                    const resourceId = el.command_json.$values[i][resourceIdPosition]
                    return { path, row: pks[resourceId] }
                })
            })
        )

        return output.flat(1)
    }
  
}

// mysql doesn't do returning * like postgres so we select the row after it's created
// small performance hit but getting generated id is necessary for orma to do nested mutations
const fetchRowsByResourceId = async (table_name: string, resourceIdsEscaped: string[]) => {
    const [rows] = await mysql.query(
        `SELECT *
        FROM ${table_name}
        WHERE resourceId IN (${resourceIdsEscaped})`
    )
    return rows as { resourceId: string; id: number }[]
}
