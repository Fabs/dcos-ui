// TDL - import wisely
import { Observable } from "rxjs/Rx";

export default const graphqlObservable = (query, schema, context) => {
  const translateOperation = {
    query: "Query"
  };

  const resolveStep = (typeMap, definition, context) => {
    if (definition.kind === "OperationDefinition") {
      const nextTypeMap = typeMap[
        translateOperation[definition.operation]
      ].getFields();

      return definition.selectionSet.selections.reduce((acc, sel) => {
        const resolvedObservable = resolveStep(nextTypeMap, sel, context);

        const merger = (acc, el) => {
          return { ...acc, [sel.name.value]: el };
        };

        return acc.combineLatest(resolvedObservable, merger);
      }, Observable.of({}));
    }

    if (definition.kind === "Field") {
      const limitedContext = {
        query: context.query,
        mutation: context.mutation
      };
      const args = definition.arguments.reduce((args, arg) => {
        return { [arg.name.value]: context[arg.name.value], ...args };
      }, {});

      return typeMap[definition.name.value].resolve(
        null,
        args,
        limitedContext,
        null
      );
    }

    return Observable.throw(
      new Error("graphqlObservable does not recognise ${definition.kind}")
    );
  };

  return resolveStep(schema._typeMap, query.definitions[0], context);
};
