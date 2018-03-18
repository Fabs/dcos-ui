import { Observable, Subject } from "rxjs";
import RepositoryList from "#SRC/js/structs/RepositoryList";

import CosmosPackagesStore from "#SRC/js/stores/CosmosPackagesStore";

const items = [
  {
    name: "universe 1",
    uri: "p1.hamburg"
  },
  {
    name: "universe 2",
    uri: "p2.hamburg"
  },
  {
    name: "universe 3",
    uri: "p3.hamburg"
  }
];

const cosmosPackageSource = Observable.timer(0, 2000)
  .map(() => CosmosPackagesStore.fetchRepositories())
  .map(() => CosmosPackagesStore.getRepositories())
  // .map(() => new RepositoryList({ items }))
  .filter(packages => typeof packages === "object")
  .distinctUntilChanged();

const searchPackages = new Subject();
const searchTerms = searchPackages
  .merge(Observable.of(""))
  .publishReplay(1)
  .refCount();

const cosmosPackages = cosmosPackageSource.combineLatest(
  searchTerms,
  (repositories, searchTerm) => {
    return { repositories, searchTerm };
  }
);

export { cosmosPackages, searchPackages };
