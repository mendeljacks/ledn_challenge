export type Transaction = {
    userId: string
    amount: number
    type: 'send' | 'receive'
    createdAt: string
}
