import "rxjs/add/operator/concat";
import { marbles } from "rxjs-marbles/jest";

describe("graphqlObservable", function() {
  it(
    "concats",
    marbles(function(m) {
      m.bind();

      const source1 = m.cold("1--2-|");
      const source2 = m.cold("1--2-|");
      const expected = m.cold("1--2-1--2-|");

      const result = source1.concat(source2);

      m.expect(result).toBeObservable(expected);
    })
  );
});
