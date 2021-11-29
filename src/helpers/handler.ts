import { serializeError } from './serializeError'
/**
 * Turns promises into express handlers
 */
export const handler = promise_fn => {
    return async (req, res) => {
        try {
            const result = await promise_fn(req, res)
            res.status(200).json(result)
        } catch (error) {
            res.status(400).json(serializeError(error))
        }
    }
}
