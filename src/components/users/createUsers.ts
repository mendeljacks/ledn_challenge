import { mysql } from '../../configs/mysql'
import { snakeCase, snakeKeys } from '../../helpers/snakeCase'
import { User } from './types'
import { userObj, userSchema } from './validation'

export const createUsers = async (users: User[]) => {
    const { value, error } = userSchema.validate(users, { abortEarly: false })
    if (error) return Promise.reject(error)

    const keys = Object.keys(userObj).map(snakeCase)
    const values = [
        value.map(obj => {
            return keys.map(key => snakeKeys(obj)[key])
        })
    ]

    const results = await mysql.query(
        `insert into db.users (${keys.map(key => `\`${key}\``).join(',')}) values ?`,
        values
    )
    return results
}
