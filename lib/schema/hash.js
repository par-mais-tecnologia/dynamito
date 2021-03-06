/*!
 * HASH Key type.
 */

import { partitionKey } from '../dynamito.traits';

/**
 * Set this key type as partition key?
 */
export const isPartition = true;

/**
 * Set this key type as range key?
 */
export const isRange = false;

/**
 * Key Type
 */
export const type = 'partition';

/**
 * Dynamo Type of this Key
 */
export const dynamoType = partitionKey;

export const validations = [field => field !== undefined];
