import mysqlPromise from 'mysql2'
import { mutate_fn, statements } from 'orma/build/mutate/mutate'
import env from '../../env.json'
import { key_by } from '../helpers/key_by'

export const mysql = mysqlPromise
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
export const pool_query = async (sql_strings: string[]) => {
    await mysql.query('use db')
    const results = await mysql.query(sql_strings.join(';')) // Faster than promise.all for many queries
    const results_arr = sql_strings.length === 1 ? [results[0]] : results[0] // mysql2 only wraps when multiple queries are sent
    return results_arr as Record<string, unknown>[][]
}

// Orma will call this function when it has mutation queries to run in parallel
export const pool_mutate: mutate_fn = async (statements: statements) => {
    const creates: statements = statements.filter(el => (el.operation = 'create'))

    const sql_strings = creates.map(el => el.command_sql)

    const results = await pool_query(sql_strings)

    const output = await Promise.all(
        creates.map(async el => {
            const column_names = el.command_json.$insert_into[1]
            const resource_id_position = column_names.findIndex(el => el === 'resource_id')
            const resource_ids_escaped = el.command_json_escaped.$values.map(
                el => el[resource_id_position]
            )

            const rows = await fetch_rows_by_resource_id(el.entity_name, resource_ids_escaped)

            const pks = key_by(el => el.resource_id)(rows)

            return el.paths.map((path, i) => {
                const resource_id = el.command_json.$values[i][resource_id_position]
                return { path, row: pks[resource_id] }
            })
        })
    )

    return output.flat(1)
}

// mysql doesn't do returning * like postgres so we select the row after it's created
// small performance hit but getting generated id is necessary for orma to do nested mutations
const fetch_rows_by_resource_id = async (table_name: string, resource_ids_escaped: string[]) => {
    const [rows] = await mysql.query(
        `SELECT *
        FROM ${table_name}
        WHERE resource_id IN (${resource_ids_escaped})`
    )
    return rows as { resource_id: string; id: number }[]
}
