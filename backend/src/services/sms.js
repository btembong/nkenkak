const twilio = require('twilio')

let client = null

function getClient() {
  if (!client && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  }
  return client
}

/**
 * Send an SMS to a single number.
 * @param {string} to  - E.164 phone number e.g. '+237612345678'
 * @param {string} body - Message text (max 160 chars for 1 credit)
 */
async function sendSms(to, body) {
  const c = getClient()
  if (!c) throw new Error('Twilio not configured (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN missing)')
  return c.messages.create({
    from: process.env.TWILIO_FROM_NUMBER,
    to,
    body,
  })
}

/**
 * Broadcast to an array of phone numbers.
 * Returns { sent, failed, results }
 */
async function broadcastSms(phones, body) {
  const c = getClient()
  if (!c) throw new Error('Twilio not configured')

  const results = await Promise.allSettled(
    phones.map(to => c.messages.create({ from: process.env.TWILIO_FROM_NUMBER, to, body }))
  )

  const sent   = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length
  return { sent, failed, total: phones.length }
}

module.exports = { sendSms, broadcastSms }
