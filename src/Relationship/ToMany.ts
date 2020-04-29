import { BaseEntity, EntityConstructor } from "../Entity/Entity";
import { PropertyKey } from "../Entity/Entity";
import { Key } from "../Datastore/Datastore";
import { getHydrator } from "../utils/hydrate";
import { getConstructor } from "../utils/entities";
import { toManySet } from "./toManySet";
import { createRelationshipMetadata } from "./relationshipMetadata";
import {
  setRelationshipMetadata,
  getRelationshipMetadatas,
} from "../utils/relationships";
import { toManyGet } from "./toManyGet";
import { assertKeyNotInUse } from "../utils/metadata";

interface ToManyOptions {
  key?: Key;
  type: EntityConstructor;
}

export function ToMany(options: ToManyOptions) {
  return (instance: BaseEntity, property: PropertyKey): void => {
    const relationshipMetadata = createRelationshipMetadata({
      options,
      property,
    });

    const constructor = getConstructor(instance);
    assertKeyNotInUse(constructor, relationshipMetadata, {
      getMetadatas: getRelationshipMetadatas,
    });
    setRelationshipMetadata(constructor, relationshipMetadata);

    const hydrator = getHydrator(options.type);

    Reflect.defineProperty(instance, property, {
      enumerable: true,
      configurable: true,
      get: function get(this: BaseEntity) {
        return toManyGet(this, relationshipMetadata, hydrator);
      },
      set: function set(this: BaseEntity, values: BaseEntity[]) {
        if (values) toManySet(this, relationshipMetadata, values);
      },
    });
  };
}