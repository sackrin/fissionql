import getObjectType from './getObjectType';
import getUnionType from './getUnionType';
import { isPolymorphic } from 'schemaly';
import { TypeHandler } from './Types';

const getTypeForContainer = async ({ model, roles, scope, options }: TypeHandler) => {
  return {
    name: options.asQuery ? model.machine : `${model.machine}Input`,
    type: !isPolymorphic(model)
      ? await getObjectType({ model, roles, scope, options })
      : await getUnionType({ model, roles, scope, options }),
    ...(options.asQuery && { resolve: model.options.resolve })
  };
};

export default getTypeForContainer;
