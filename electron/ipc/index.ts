import { registerWineHandlers } from './wine.handlers'
import { registerCellarHandlers } from './cellar.handlers'
import { registerTastingHandlers } from './tasting.handlers'
import { registerPairingHandlers } from './pairing.handlers'
import { registerAuthHandlers } from './auth.handlers'
import { registerCsvHandlers } from './csv.handlers'
import { registerLabelHandlers } from './label.handlers'

export function registerAllHandlers() {
  registerWineHandlers()
  registerCellarHandlers()
  registerTastingHandlers()
  registerPairingHandlers()
  registerAuthHandlers()
  registerCsvHandlers()
  registerLabelHandlers()
}
