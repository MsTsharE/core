import '../metadata'

import { BaseEntity, EntityConstructor } from '../Entity/Entity'
import {
  ColumnMetadata,
  COLUMN_METADATA_KEY,
  COLUMNS_ON_ENTITY_KEY,
  ConstantColumnMetadata,
  ColumnKey,
} from '../Column/Column'
import { Value } from '../Datastore/Datastore'
import { getEntityConstructor } from './entity'
import { ColumnMetadataLookupError } from './errors'

export const getConstantColumns = (
  constructor: EntityConstructor<BaseEntity>
): ConstantColumnMetadata[] => {
  return Reflect.getMetadata(COLUMNS_ON_ENTITY_KEY, constructor) || []
}

export const getColumns = (instance: BaseEntity): ColumnMetadata[] => {
  const constantColumns = getConstantColumns(getEntityConstructor(instance))
  const properties = constantColumns.map(
    constantMetadata => constantMetadata.property
  )
  return properties
    .map(property =>
      Reflect.getMetadata(COLUMN_METADATA_KEY, instance, property.toString())
    )
    .filter(metadata => metadata !== undefined)
}

export const setColumn = (instance: BaseEntity, column: ColumnMetadata): void =>
  Reflect.defineMetadata(COLUMN_METADATA_KEY, column, instance, column.property)

export const getColumn = (
  instance: BaseEntity,
  property: ColumnKey
): ColumnMetadata => {
  const columnMetadata = Reflect.getMetadata(
    COLUMN_METADATA_KEY,
    instance,
    property
  )
  if (columnMetadata === undefined)
    throw new ColumnMetadataLookupError(
      instance,
      property,
      `Could not find metadata of Column. Has it been defined yet?`
    )

  return columnMetadata
}

export const getPrimaryColumn = (
  instance: BaseEntity
): ColumnMetadata | undefined => {
  return getColumns(instance).find(({ isPrimary }) => isPrimary)
}

export const getPrimaryColumnValue = async (
  instance: BaseEntity
): Promise<Value> => {
  const primaryColumn = getPrimaryColumn(instance)
  if (primaryColumn === undefined)
    throw new Error(`Primary Column not specified on instance`)
  return await instance[primaryColumn.property]
}

export const setPrimaryColumnValue = (
  instance: BaseEntity,
  value: Value
): void => {
  const primaryColumn = getPrimaryColumn(instance)
  if (primaryColumn === undefined)
    throw new Error(`Primary Column not specified on instance`)
  primaryColumn.cachedValues.set(instance, {
    isDirty: false,
    cachedValue: value,
  })
  setColumn(instance, primaryColumn)
}
