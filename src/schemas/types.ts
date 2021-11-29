export type Transaction = {
    userId: string
    amount: number
    type: 'send' | 'receive'
    createdAt: string
}

export type User = {
    firstName: string;
    lastName: string;
    country: string;
    email: string;
    dob: string;
    mfa: string;
    createdAt: string;
    updatedAt: string;
    referredBy: string;
}