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

// NOTE: The functions below will no longer be necessary with orma@1.0.48 and above
// Stitching of ids for sequential nested creates will be handled in future versions of orma

export const poolQuery = async (sql_strings: string[]) => {
    await mysql.query('use db')
    const results = await mysql.query(sql_strings.join(';')) // Faster than promise.all for many queries
    const results_arr = sql_strings.length === 1 ? [results[0]] : results[0] // mysql2 only wraps when multiple queries are sent
    return results_arr as Record<string, unknown>[][]
}

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
    const updates_deletes: statements = statements.filter(
        el => el.operation === 'update' || el.operation === 'delete'
    )
    if (updates_deletes.length > 0) {
        const sql_strings = updates_deletes.map(el => el.command_sql)

        const results = await poolQuery(sql_strings)

        const output = updates_deletes.map(statement => {
            const path = statement.paths[0]
            const row = { affectedRows: results[0].affectedRows }
            return { path, row }
        })

        return output
    }
}

const fetchRowsByResourceId = async (table_name: string, resourceIdsEscaped: string[]) => {
    const [rows] = await mysql.query(
        `SELECT *
        FROM ${table_name}
        WHERE resourceId IN (${resourceIdsEscaped})`
    )
    return rows as { resourceId: string; id: number }[]
}
