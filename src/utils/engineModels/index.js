/**
 * src/utils/engineModels/index.js
 * 
 * Powertrain Physics Dispatcher.
 * Provides a unified step(engineTypeOrId, state, inputs, dt) interface.
 */

import { getEngineType } from '../../config/engineTypes.js';
import { stepIcePetrol } from './icePetrol.js';
import { stepIceTurbo } from './iceTurbo.js';
import { stepIceDiesel } from './iceDiesel.js';
import { stepIceCng } from './iceCng.js';
import { stepHybrid } from './hybrid.js';
import { stepBev } from './bev.js';

export { stepIcePetrol } from './icePetrol.js';
export { stepIceTurbo } from './iceTurbo.js';
export { stepIceDiesel } from './iceDiesel.js';
export { stepIceCng } from './iceCng.js';
export { stepHybrid } from './hybrid.js';
export { stepBev } from './bev.js';

/**
 * Unified simulation step dispatcher for any engine type.
 */
export function stepEngineModel(engineTypeOrId, state = {}, inputs = {}, dt = 0.05) {
  const engineType = typeof engineTypeOrId === 'string' ? getEngineType(engineTypeOrId) : engineTypeOrId;
  const engineId = engineType?.id || 'i4_petrol';

  switch (engineId) {
    case 'i3_turbo':
      return stepIceTurbo(engineType, state, inputs, dt);

    case 'i4_diesel':
      return stepIceDiesel(engineType, state, inputs, dt);

    case 'i4_cng':
      return stepIceCng(engineType, state, inputs, dt);

    case 'hybrid_atkinson':
      return stepHybrid(engineType, state, inputs, dt);

    case 'bev_pmsm':
      return stepBev(engineType, state, inputs, dt);

    case 'i4_petrol':
    case 'v6_petrol':
    case 'v8_petrol':
    case 'boxer4':
    case 'single_4s':
    default:
      return stepIcePetrol(engineType, state, inputs, dt);
  }
}
