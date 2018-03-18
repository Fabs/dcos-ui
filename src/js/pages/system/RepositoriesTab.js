import RepositoriesTabUI from "#SRC/js/components/RepositoriesTabUI";

import { observe } from "#SRC/js/data-service/ui";
import {
  cosmosPackages,
  searchPackages
} from "#SRC/js/streams/CosmosPackagesStream";

const operations = {
  repositories: source =>
    source.map(res => res.repositories.filterItemsByText(res.searchTerm)),
  searchString: source => source.map(element => element.searchTerm)
};

const eventHandlers = {
  onSearch: term => searchPackages.next(term)
};

const RepositoriesTab = observe(
  cosmosPackages,
  operations,
  eventHandlers
).react(RepositoriesTabUI);

RepositoriesTab.routeConfig = {
  label: "Package Repositories",
  matches: /^\/settings\/repositories/
};

module.exports = RepositoriesTab;
