import joi from 'joi'
import { countryListAlpha2 } from '../../helpers/countries'

export const userObj = {
    firstName: joi.string().required().min(1).max(45),
    lastName: joi.string().required().min(1).max(45),
    country: joi
        .string()
        .valid(...Object.keys(countryListAlpha2))
        .required(),
    email: joi.string().required().email(),
    dob: joi.date().required(),
    mfa: joi.string().required().valid('TOTP', 'SMS').allow(null),
    referredBy: joi.number().positive().integer().allow(null),
    createdAt: joi.date(),
    updatedAt: joi.date()
}

export const userSchema = joi.array().items(joi.object().keys(userObj)).min(1)
