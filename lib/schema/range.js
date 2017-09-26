/*!
 * RANGE Key type.
 */

import { sortkey } from '../dynamito.traits';

/**
 * Set this key type as partition key?
 */
export const isPartition = false;

/**
 * Set this key type as range key?
 */
export const isRange = true;

/**
 * Key Type
 */
export const type = 'range';

/**
 * Dynamo Type of this Key
 */
export const dynamoType = sortkey;

export const validations = [field => field !== undefined];
