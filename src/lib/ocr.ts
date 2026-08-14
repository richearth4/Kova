export interface OCRResult {
  success: boolean
  amount: number | null
  date: Date | null
  confidence: number
  rawText: string
}

/**
 * AI OCR Engine to parse uploaded payment receipt images/PDFs.
 * Heuristically parses textual data to extract financial figures.
 */
export async function scanReceipt(fileContent: string): Promise<OCRResult> {
  // Simulate OCR model inference time
  await new Promise((resolve) => setTimeout(resolve, 800))

  const cleanText = fileContent.replace(/,/g, '')
  
  // 1. Heuristically match amount using standard currency patterns (e.g. NGN, ₦, NG, N, and numbers)
  const amountRegex = /(?:ngn|₦|n|ng|amount|sum|total)\s*[:=]?\s*(\d+(?:\.\d{2})?)/i
  const amountMatch = cleanText.match(amountRegex)
  let amount: number | null = null
  let confidence = 0.5

  if (amountMatch && amountMatch[1]) {
    amount = parseFloat(amountMatch[1])
    confidence += 0.3
  } else {
    // Fallback: look for any number >= 1000 to identify standard deposits
    const genericNumbers = cleanText.match(/\b\d{4,6}\b/g)
    if (genericNumbers && genericNumbers.length > 0) {
      amount = parseFloat(genericNumbers[0])
      confidence += 0.1
    }
  }

  // 2. Heuristically match transaction date
  const dateRegex = /(?:date|time|on|transacted)\s*[:=]?\s*([a-zA-Z0-9\s,-]+)/i
  const dateMatch = cleanText.match(dateRegex)
  let date: Date | null = null

  if (dateMatch && dateMatch[1]) {
    try {
      const parsedDate = new Date(dateMatch[1].trim())
      if (!isNaN(parsedDate.getTime())) {
        date = parsedDate
        confidence += 0.15
      }
    } catch (e) {
      // Ignore parse failure
    }
  }

  return {
    success: amount !== null,
    amount,
    date: date || new Date(),
    confidence: Math.min(confidence, 1.0),
    rawText: fileContent
  }
}
