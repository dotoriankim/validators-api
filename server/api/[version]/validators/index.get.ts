import type { Validator } from 'nimiq-rpc-client-ts'
import { getRpcClient } from '~~/server/lib/client'
import { mainQuerySchema } from '~~/server/utils/schemas'
import { fetchValidators } from '~~/server/utils/validators'
import { consola } from 'consola'
import { getRange } from 'nimiq-validators-trustscore'

// export default defineCachedEventHandler(async (event) => {
export default defineEventHandler(async (event) => {
  const params = await getValidatedQuery(event, mainQuerySchema.parse)

  const { data: _isOnline } = await getRpcClient().blockchain.getBlockNumber()
  const isOnline = !!_isOnline

  let addresses: string[] = []

  const epochNumber = 1

  // In case server is offline, at least we can show the database data
  if (isOnline) {
    let activeValidators: Validator[] = []
    if (params['only-active'] && isOnline) {
      const { data: _activeValidators, error: errorActiveValidators } = await getRpcClient().blockchain.getActiveValidators()
      if (errorActiveValidators)
        return createError(errorActiveValidators)
      activeValidators = _activeValidators
      addresses = activeValidators.map(v => v.address)
    }

    const range = await getRange(getRpcClient())
    if (!(await checkIfScoreExistsInDb(range))) {
      const { data, error } = await calculateScores(range)
      if (!data || error)
        consola.warn(`Error calculating scores for range ${JSON.stringify(range)}`, error)
    }

    const { data: epochNumber, error: errorEpochNumber } = await getRpcClient().blockchain.getEpochNumber()
    if (errorEpochNumber || !epochNumber)
      throw createError(errorEpochNumber || 'Epoch number not found')
    // epochNumber = _epochNumber - 1
  }

  const { data: validators, error: errorValidators } = await fetchValidators({ ...params, addresses, epochNumber })
  if (errorValidators || !validators)
    throw createError(errorValidators)

  return validators
// }, {
//   // maxAge: import.meta.dev ? 1 : 10, // 10 minutes
})
