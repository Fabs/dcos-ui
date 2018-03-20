This package is to be extracted to dcos-ui/data-service.

# API v1

## Mediator Pattern

The [mediator pattern](https://en.wikipedia.org/wiki/Mediator_pattern) is used here
to decouple data handling from the view components by encapsulating the way they
communicate. 

With this pattern, a component will receive down all the data `(data down)` it needs via props,
and send `events up` so the mediator can perform mutations (represented here as a simple callback). 
The key concept here is that both the data provider and the view component have no idea how each other work.
Only the caller of `renderComponents` understands how it works.  

```js
  /*
   * Receives a stream of React.Component and outputs a single components that 
   * renders the most recevent event from the Observable.
  */
  renderComponents(component$: Observable<React.Component>): React.Component;
```

Here is an example of how it could be used to render a page for `space shuttles`
that shows which shuttles are on space, and which are ready to be launched.

```js
// Imagine we manage a launchpad for interplanetary ships
import { shuttles$, launchShuttle } from "shuttles/streams";
import { Space, LaunchPad, LoadingUI, ErrorMessageUI } from "ui/components"
import { renderComponents } from "data-service"


// Merging this streams should be done via graphql in the future
// See bellow for the equivalent graphql.
const launched$ = shuttles$.filter((sht) => sht.location === "space");
const nextLaunches$ = shuttles$.filter((sht) => sht.location === "earth");
const content$ = launched$.combineLatest(nextLaunches$,
                          (launched, nextLaunches) => {launched, nextLaunches});

//See also bellow about graphql mutations
const launch = (name) => {
  launchShuttle({name, launchDate: new Date()})
}

const components$ = content$.map((data) => 
                                <World>
                                  <LaunchPad shuttles={data.nextLaunches} />
                                  <Space shuttles={data.launched} />
                                  <LaunchButton onLaunch={launch} />
                                </World>)
                            .startWith(<LoadingUI />)                                
                            .catch((err) => <ErrorMessageUI err>));

export default renderComponents(components$);
```

Notice how easy is to provide error handling whenever an exception happens and how 
we could start the stream of components providing a loading component.

If you would be using graphql, the `content$` would be created through graphql and the code
would look like:
```js
// Imagine we manage a launchpad for interplanetary ships
import { shuttles$, launchShuttle } from "shuttles/streams";
import { Space, LaunchPad, LoadingUI, ErrorMessageUI } from "ui/components"
import { renderComponents } from "data-service"

import { shuttleSchema } from "shuttles/schema";

const query = `
  query launched(){ 
    shuttle(location: "space") {
      name
      launchDate
    } 
  }
  
  query nextLaunches($padLocation: String!){ 
    shuttle(location: $padLocation) {
      name
    } 
  }
`);

const content$ = graphql(query, shuttleSchema, {padLocation: "earth"}); 

const launchMutation = `
  mutation {
    launchShip(name: $name, launchDate: $launchDate) {
      name
      launchDate 
    }
  }
`;

const launch = (name) => {
  const launchDate = new Date();
  graphql(launchMutation, shuttleSchema).mutate({ name, launchDate });
}

const components$ = content$.map((data) => 
                                <World>
                                  <LaunchPad shuttles={data.nextLaunches} />
                                  <Space shuttles={data.launched} />
                                  <LaunchButton onLaunch={launch} />
                                </World>)
                            .startWith(<LoadingUI />)                                
                            .catch((err) => <ErrorMessageUI err>));

export default renderComponents(components$);
```
