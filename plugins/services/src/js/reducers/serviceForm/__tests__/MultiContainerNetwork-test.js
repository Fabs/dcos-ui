const MultiContainerNetwork = require("../MultiContainerNetwork");
const Networking = require("#SRC/js/constants/Networking");
const Batch = require("#SRC/js/structs/Batch");
const { ADD_ITEM } = require("#SRC/js/constants/TransactionTypes");
const Transaction = require("#SRC/js/structs/Transaction");

describe("MultiContainerNetwork", function() {
  describe("#JSONReducer", function() {
    it("is host default type", function() {
      const batch = new Batch();

      expect(batch.reduce(MultiContainerNetwork.JSONReducer.bind({}))).toEqual([
        { mode: "host" }
      ]);
    });

    it("returns a network with mode host by default", function() {
      let batch = new Batch();

      batch = batch.add(new Transaction(["networks", 0], Networking.type.HOST));

      expect(batch.reduce(MultiContainerNetwork.JSONReducer.bind({}))).toEqual([
        { mode: "host" }
      ]);
    });

    it("returns a network with mode container", function() {
      let batch = new Batch();

      batch = batch.add(
        new Transaction(["networks", 0], `${Networking.type.CONTAINER}.foo`)
      );

      expect(batch.reduce(MultiContainerNetwork.JSONReducer.bind({}))).toEqual([
        { mode: "container", name: "foo" }
      ]);
    });

    it("resets network to mode host", function() {
      let batch = new Batch();

      batch = batch.add(
        new Transaction(["networks", 0], `${Networking.type.CONTAINER}.foo`)
      );
      batch = batch.add(new Transaction(["networks", 0], Networking.type.HOST));

      expect(batch.reduce(MultiContainerNetwork.JSONReducer.bind({}))).toEqual([
        { mode: "host" }
      ]);
    });

    it("creates the right network object", function() {
      let batch = new Batch();

      batch = batch.add(
        new Transaction(
          ["networks", 0],
          { mode: Networking.type.CONTAINER, name: "foo" },
          ADD_ITEM
        )
      );
      batch = batch.add(
        new Transaction(["networks", 0, "mode"], `${Networking.type.CONTAINER}`)
      );
      batch = batch.add(new Transaction(["networks", 0, "name"], "foo"));

      expect(batch.reduce(MultiContainerNetwork.JSONReducer.bind({}))).toEqual([
        {
          mode: "container",
          name: "foo"
        }
      ]);
    });
  });
  describe("#FORMReducer", function() {
    it("creates the right network object", function() {
      let batch = new Batch();

      batch = batch.add(
        new Transaction(
          ["networks", 0],
          { mode: Networking.type.CONTAINER, name: "foo" },
          ADD_ITEM
        )
      );
      batch = batch.add(
        new Transaction(["networks", 0, "mode"], `${Networking.type.CONTAINER}`)
      );
      batch = batch.add(new Transaction(["networks", 0, "name"], "foo"));

      expect(batch.reduce(MultiContainerNetwork.FormReducer.bind({}))).toEqual([
        {
          mode: "CONTAINER",
          name: "foo"
        }
      ]);
    });
  });
});
