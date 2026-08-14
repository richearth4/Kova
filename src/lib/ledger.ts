import { prisma } from './prisma'
import { AccountType, Prisma } from '@prisma/client'

export interface LedgerPostingInput {
  accountId: string
  debit: number
  credit: number
}

/**
 * Gets an account by code or creates it if it doesn't exist.
 */
export async function getOrCreateAccount(
  tenantId: string,
  code: string,
  name: string,
  type: AccountType,
  userId?: string | null,
  tx: Prisma.TransactionClient = prisma
) {
  const account = await tx.account.findUnique({
    where: {
      tenantId_code: {
        tenantId,
        code
      }
    }
  })

  if (account) return account

  return await tx.account.create({
    data: {
      tenantId,
      code,
      name,
      type,
      userId: userId || null,
      balance: 0
    }
  })
}

/**
 * Posts a double-entry journal entry to the ledger.
 * Total debits must equal total credits.
 */
export async function postJournalEntry(
  tenantId: string,
  reference: string,
  description: string,
  postings: LedgerPostingInput[],
  tx: Prisma.TransactionClient
) {
  if (postings.length === 0) {
    throw new Error('Cannot post journal entry with no postings')
  }

  // 1. Calculate sum of debits and credits
  let totalDebit = new Prisma.Decimal(0)
  let totalCredit = new Prisma.Decimal(0)

  for (const p of postings) {
    if (p.debit < 0 || p.credit < 0) {
      throw new Error('Debit and credit amounts must be non-negative')
    }
    totalDebit = totalDebit.add(new Prisma.Decimal(p.debit.toFixed(2)))
    totalCredit = totalCredit.add(new Prisma.Decimal(p.credit.toFixed(2)))
  }

  if (!totalDebit.equals(totalCredit)) {
    throw new Error(`Double-entry integrity check failed: Total Debits (₦${totalDebit}) must equal Total Credits (₦${totalCredit})`)
  }

  // 2. Create the JournalEntry
  const journal = await tx.journalEntry.create({
    data: {
      tenantId,
      reference,
      description
    }
  })

  // 3. Create Ledger Entries (postings) and update Account balances
  for (const p of postings) {
    const debitDec = new Prisma.Decimal(p.debit.toFixed(2))
    const creditDec = new Prisma.Decimal(p.credit.toFixed(2))

    await tx.ledgerEntry.create({
      data: {
        tenantId,
        journalEntryId: journal.id,
        accountId: p.accountId,
        debit: debitDec,
        credit: creditDec
      }
    })

    // Update account balance:
    // For ASSETS and EXPENSES: balance increases with debits, decreases with credits.
    // For LIABILITIES, EQUITY, and REVENUES: balance decreases with debits, increases with credits.
    const account = await tx.account.findUnique({
      where: { id: p.accountId }
    })

    if (!account) {
      throw new Error(`Account not found: ${p.accountId}`)
    }

    let balanceChange = new Prisma.Decimal(0)
    if (account.type === AccountType.ASSET || account.type === AccountType.EXPENSE) {
      balanceChange = debitDec.sub(creditDec)
    } else {
      balanceChange = creditDec.sub(debitDec)
    }

    await tx.account.update({
      where: { id: p.accountId },
      data: {
        balance: {
          increment: balanceChange
        }
      }
    })
  }

  return journal
}

/**
 * Standard transaction helper to record a Member Contribution (deposit).
 * Debits Cash at Bank (ASSET), Credits Member's Contribution Savings (LIABILITY).
 */
export async function recordMemberContribution(
  tenantId: string,
  userId: string,
  amount: number,
  reference: string,
  description: string,
  tx: Prisma.TransactionClient
) {
  // Cash at Bank (Cooperative Asset Account)
  const cashAccount = await getOrCreateAccount(
    tenantId,
    '1000-CASH',
    'Cash at Bank',
    AccountType.ASSET,
    null,
    tx
  )

  // Member-specific Savings (Cooperative Liability Account)
  const memberSavingsAccount = await getOrCreateAccount(
    tenantId,
    `2100-MEMBER-SAVINGS-${userId}`,
    `Member Savings - User ${userId}`,
    AccountType.LIABILITY,
    userId,
    tx
  )

  return await postJournalEntry(
    tenantId,
    reference,
    description,
    [
      { accountId: cashAccount.id, debit: amount, credit: 0 },
      { accountId: memberSavingsAccount.id, debit: 0, credit: amount }
    ],
    tx
  )
}

/**
 * Standard transaction helper to record a Loan Disbursement.
 * Debits Member's Loan Receivable (ASSET), Credits Cash at Bank (ASSET).
 */
export async function recordLoanDisbursement(
  tenantId: string,
  userId: string,
  principal: number,
  interest: number,
  reference: string,
  description: string,
  tx: Prisma.TransactionClient
) {
  const cashAccount = await getOrCreateAccount(
    tenantId,
    '1000-CASH',
    'Cash at Bank',
    AccountType.ASSET,
    null,
    tx
  )

  const loanReceivableAccount = await getOrCreateAccount(
    tenantId,
    `1110-MEMBER-LOAN-${userId}`,
    `Member Loan - User ${userId}`,
    AccountType.ASSET,
    userId,
    tx
  )

  const interestRevenueAccount = await getOrCreateAccount(
    tenantId,
    '4000-INTEREST-INCOME',
    'Interest Income',
    AccountType.REVENUE,
    null,
    tx
  )

  // Double entry logic:
  // Debit: Loan Receivable (Principal + Interest)
  // Credit: Cash at Bank (Principal disbursed)
  // Credit: Interest Income (Unearned/accrued interest revenue)
  return await postJournalEntry(
    tenantId,
    reference,
    description,
    [
      { accountId: loanReceivableAccount.id, debit: principal + interest, credit: 0 },
      { accountId: cashAccount.id, debit: 0, credit: principal },
      { accountId: interestRevenueAccount.id, debit: 0, credit: interest }
    ],
    tx
  )
}

/**
 * Standard transaction helper to record a Loan Repayment.
 * Debits Cash at Bank (ASSET), Credits Member's Loan Receivable (ASSET).
 */
export async function recordLoanRepayment(
  tenantId: string,
  userId: string,
  amount: number,
  reference: string,
  description: string,
  tx: Prisma.TransactionClient
) {
  const cashAccount = await getOrCreateAccount(
    tenantId,
    '1000-CASH',
    'Cash at Bank',
    AccountType.ASSET,
    null,
    tx
  )

  const loanReceivableAccount = await getOrCreateAccount(
    tenantId,
    `1110-MEMBER-LOAN-${userId}`,
    `Member Loan - User ${userId}`,
    AccountType.ASSET,
    userId,
    tx
  )

  return await postJournalEntry(
    tenantId,
    reference,
    description,
    [
      { accountId: cashAccount.id, debit: amount, credit: 0 },
      { accountId: loanReceivableAccount.id, debit: 0, credit: amount }
    ],
    tx
  )
}
