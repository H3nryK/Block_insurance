import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from '../../../declarations/insurance_backend';

export function createActor(canisterId, options = {}) {
  const agent = new HttpAgent(options.agentOptions);
  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
  });
}