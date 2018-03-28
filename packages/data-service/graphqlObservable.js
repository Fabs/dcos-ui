// TDL - import wisely
import { Observable } from "rxjs/Rx";

/* eslint-disable import/prefer-default-export */
export const graphqlObservable = (doc, schema, context) => {
  const translateOperation = {
    query: "Query"
  };

  const resolveStep = (typeMap, definition, context, parent) => {
    if (definition.kind === "OperationDefinition") {
      const nextTypeMap = typeMap[
        translateOperation[definition.operation]
      ].getFields();

      return definition.selectionSet.selections.reduce((acc, sel) => {
        const resolvedObservable = resolveStep(nextTypeMap, sel, context);

        const merger = (acc, el) => {
          const propertyName = definition.name !== undefined ? definition.name.value : sel.name.value;

          return { ...acc, [propertyName]: el };
        };

        return acc.combineLatest(resolvedObservable, merger);
      }, Observable.of({}));
    }

    // Node Field
    if (definition.kind === "Field" && definition.selectionSet !== undefined) {
      const limitedContext = {
        query: context.query,
        mutation: context.mutation
      };
      const args = definition.arguments.reduce((args, arg) => {
        return { [arg.name.value]: context[arg.value.name.value], ...args };
      }, {});

      const resolvedObservable = typeMap[definition.name.value].resolve(
        parent,
        args,
        limitedContext,
        null
      );

      return resolvedObservable.map(emittedResults => {
        return emittedResults.map(result => {
          return definition.selectionSet.selections.reduce((acc, sel) => {
            acc[sel.name.value] = resolveStep(typeMap, sel, context, result);

            return acc;
          }, {});
        });
      });
    }

    // LeafField
    if (definition.kind === "Field") {
      return parent[definition.name.value];
    }

    return Observable.throw(
      new Error("graphqlObservable does not recognise ${definition.kind}")
    );
  };

  if(doc.definitions.length === 1) {
    return resolveStep(schema._typeMap, doc.definitions[0], context, null);
  }

  return doc.definitions.reduce((acc, definition) => {
    const resolvedObservable = resolveStep(schema._typeMap, definition, context, null);

    const merger = (acc, resolved) => {
      return { ...acc, ...resolved };
    };

    return acc.combineLatest(resolvedObservable, merger);
  }, Observable.of({}));
};
/* eslint-enable */
