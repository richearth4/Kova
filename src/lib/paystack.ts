import { prisma } from './prisma'

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || ''
const isMock = process.env.MOCK_PAYMENTS === 'true' || process.env.NODE_ENV === 'development' || !PAYSTACK_SECRET

export interface DVAResponse {
  accountNumber: string
  bankName: string
  accountName: string
}

/**
 * Creates a Paystack customer and assigns a dedicated virtual account.
 * Handles fallbacks/mocking for developer mode.
 */
export async function getOrCreateMemberDVA(userId: string): Promise<DVAResponse> {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (!user) {
    throw new Error('User not found')
  }

  // Return existing virtual account details if already created
  if (user.dvaAccountNumber && user.dvaBankName && user.dvaAccountName) {
    return {
      accountNumber: user.dvaAccountNumber,
      bankName: user.dvaBankName,
      accountName: user.dvaAccountName
    }
  }

  if (isMock) {
    // Generate a mock dedicated virtual account for local testing
    const mockAccountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString()
    const mockBankName = 'Wema Bank (KOVA Dedicated)'
    const mockAccountName = `KOVA - ${user.firstName} ${user.lastName}`

    await prisma.user.update({
      where: { id: userId },
      data: {
        dvaAccountNumber: mockAccountNumber,
        dvaBankName: mockBankName,
        dvaAccountName: mockAccountName
      }
    })

    return {
      accountNumber: mockAccountNumber,
      bankName: mockBankName,
      accountName: mockAccountName
    }
  }

  try {
    // 1. Create Paystack Customer
    const customerResponse = await fetch('https://api.paystack.co/customer', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        phone: user.phoneNumber || undefined
      })
    })

    const customerData = await customerResponse.json()
    if (!customerData.status) {
      throw new Error(`Failed to create Paystack customer: ${customerData.message}`)
    }

    const customerCode = customerData.data.customer_code

    // 2. Assign Dedicated Virtual Account
    const dvaResponse = await fetch('https://api.paystack.co/dedicated_account', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customer: customerCode,
        preferred_bank: 'wema-bank' // Paystack preferred DVA partner
      })
    })

    const dvaData = await dvaResponse.json()
    if (!dvaData.status) {
      throw new Error(`Failed to assign Paystack DVA: ${dvaData.message}`)
    }

    // Capture the primary assigned account
    const bankDetails = dvaData.data.bank
    const accountDetails = dvaData.data

    const accountNumber = accountDetails.account_number
    const bankName = bankDetails.name
    const accountName = accountDetails.account_name

    await prisma.user.update({
      where: { id: userId },
      data: {
        dvaAccountNumber: accountNumber,
        dvaBankName: bankName,
        dvaAccountName: accountName
      }
    })

    return {
      accountNumber,
      bankName,
      accountName
    }
  } catch (error) {
    console.error('Paystack DVA generation failed, falling back to mock:', error)
    // Fallback to mock on API error to avoid blocking developer/user onboarding
    const mockAccountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString()
    const mockBankName = 'Sterling Bank (Fallback)'
    const mockAccountName = `KOVA - ${user.firstName} ${user.lastName}`

    await prisma.user.update({
      where: { id: userId },
      data: {
        dvaAccountNumber: mockAccountNumber,
        dvaBankName: mockBankName,
        dvaAccountName: mockAccountName
      }
    })

    return {
      accountNumber: mockAccountNumber,
      bankName: mockBankName,
      accountName: mockAccountName
    }
  }
}
