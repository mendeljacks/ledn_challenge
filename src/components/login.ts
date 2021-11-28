import jwt from 'jsonwebtoken'
import env from '../../env.json'

const logins = {
    admin: 'password'
}

export const login = async (username, password) => {
    if (!username) return Promise.reject('Must enter a email')
    if (!password) return Promise.reject('Must enter a password')
    if (!logins[username]) return Promise.reject('Incorrect email')

    const token = await new Promise((resolve, reject) => {
        jwt.sign(
            { email: username },
            env.jwt_secret_key,
            /*{expiresIn: 60},*/ (err, token) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(token)
                }
            }
        )
    })

    return token
}
