import React from "react";
import { Observable } from "rxjs";

// Recompose helps handle data down and event up as streams
import {
  createEventHandler,
  componentFromStream
} from "#PACKAGES/data-service/recomposeRx";

// Our in-house solution to resolve graphql queries using streams
import { graphqlObservable } from "#PACKAGES/data-service/graphqlObservable";

// tools to make easier to create schemas and queries
import { makeExecutableSchema } from "graphql-tools";
import gql from "graphql-tag";

// Streams we get our data from
import { fetchRepositories } from "#PLUGINS/catalog/src/js/repositories/repositoriesStream";

// The graphql schema and resolvers for those streams;
import { typeDefs, resolvers } from "#SRC/js/model/repositoryModel";

// UI components
import RepositoriesTabUI from "#SRC/js/components/RepositoriesTabUI";
import RepositoryList from "#SRC/js/structs/RepositoryList";

// Using the data layer

// 1. We first make an schema out of the resolvers and typeDefinitions
const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

// 2. We declare which data our component needs in graphql (data down)
const packageRepositoryQuery = gql`
  query {
    packageRepository(filter: $filter) {
      name
      uri
    }
  }
`;

// 3. We create an event handler as a stream to deal with search (events up)
const { handler: onSearch, stream: searchEvent$ } = createEventHandler();
const searchTerm$ = searchEvent$.startWith("");

// 4. We compose the result with the query, and massage it down the pipe until
// we get the props for our component.
// The idea is from an Observable of data and events, compose a stream o React.Components
const components$ = graphqlObservable(packageRepositoryQuery, schema, {
  query: fetchRepositories(),
  filter: searchTerm$
})
  .combineLatest(searchTerm$, (result, searchTerm) => {
    // Backwards compatible with the previous struct/RepositoryList for packages
    return {
      packageRepository: new RepositoryList({
        items: result.packageRepository
      }),
      searchTerm
    };
  })
  // We map over the data and return a component to render
  .map(data => {
    return (
      <RepositoriesTabUI
        repositories={data.packageRepository}
        searchTerm={data.searchTerm}
        onSearch={onSearch}
      />
    );
  })
  // The first component is the loading
  .startWith(<RepositoriesTabUI.Loading />)
  // If anything goes wrong, we render an error component
  .catch(err => Observable.of(<RepositoriesTabUI.Error err={err} />));

// componentFromStream create a single component who render the latest emitted
// component from the stream
const RepositoriesTab = componentFromStream(() => components$);

// the reason we don`t `export componentFromStream()` is so you can add those
// router specific things
RepositoriesTab.routeConfig = {
  label: "Package Repositories",
  matches: /^\/settings\/repositories/
};

module.exports = RepositoriesTab;
