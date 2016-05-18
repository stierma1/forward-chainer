var plan = require("../lib/plan-iddfs-async-multi");
var chai = require("chai");
var expect = chai.expect;

var isAcceptable = function(state){
  return state.get("act1_changed_state") && state.get("act2_changed_state");
}

describe("plan-async-multi", function(){

  it("should return a plan", function(done){
    var actions = [
      {
        action: "act1",
        possible:function(state, history){
          return true;
        },
        updateState: function(state){
          return [state.set("act1_changed_state", true)];
        }
      },
      {
        action: "act2",
        possible:function(state, history){
          return true;
        },
        updateState: function(state){
          return [state.set("act2_changed_state", true)];
        }
      }
    ];

    var myPlan = plan(actions, {}, isAcceptable);

    //var fPlan = myPlan.next();
    myPlan.then((firstPlan) => {
      expect(firstPlan.value.length).to.equal(2);
      expect(firstPlan.value[0].actionObj.action).to.equal("act1");
      expect(firstPlan.value[1].actionObj.action).to.equal("act2");
      done();
    })
    .catch(done)

  });

  it("should return a plan only if actions are possible", function(done){
    var actions = [
      {
        action: "act1",
        possible:function(state, history){
          return true;
        },
        updateState: function(state){
          return [state.set("act1_changed_state", true)];
        }
      },
      {
        action: "act2",
        possible:function(state, history){
          return [state.get("act1_changed_state")];
        },
        updateState: function(state){
          return [state.set("act2_changed_state", true)];
        }
      }
    ];

    var myPlan = plan(actions, {}, isAcceptable);

    myPlan.then((firstPlan) => {
      expect(firstPlan.value.length).to.equal(2);
      expect(firstPlan.value[0].actionObj.action).to.equal("act1");
      expect(firstPlan.value[1].actionObj.action).to.equal("act2");
      done();
    })
    .catch(done)
  });

  it("should iterate to get all possible plans", function(done){
    var actions = [
      {
        action: "act1",
        possible:function(state, history){
          return true;
        },
        updateState: function(state){
          return [state.set("act1_changed_state", true)];
        }
      },
      {
        action: "act2",
        possible:function(state, history){
          return true;
        },
        updateState: function(state){
          return [state.set("act2_changed_state", true)];
        }
      }
    ];

    var myPlan = plan(actions, {}, isAcceptable,2);

    myPlan.then((nextPlan) => {
      expect(nextPlan.value.length).to.equal(2);
      if(nextPlan.value[0].actionObj.action === "act1"){
        expect(nextPlan.value[1].actionObj.action).to.equal("act2");
      } else {
        expect(nextPlan.value[1].actionObj.action).to.equal("act1");
      }
      return nextPlan.continue();
    })
    .then((nextPlan) => {
      expect(nextPlan.value.length).to.equal(2);
      if(nextPlan.value[0].actionObj.action === "act1"){
        expect(nextPlan.value[1].actionObj.action).to.equal("act2");
      } else {
        expect(nextPlan.value[1].actionObj.action).to.equal("act1");
      }
      return nextPlan.continue();
    })
    .then((nextPlan) => {
      expect(nextPlan.done).to.be.true;
      done();
    })
    .catch(done)
  });

  it("should halt if maxDepth is reached", function(done){
    var actions = [
      {
        action: "act1",
        possible:function(state, history){
          return true;
        },
        updateState: function(state){
          return [state.set("act1_changed_state", true)];
        }
      },
      {
        action: "act2",
        possible:function(state, history){
          return true;
        },
        updateState: function(state){
          return [state.set("act2_changed_state", true)];
        }
      }
    ];

    var myPlan = plan(actions, {}, isAcceptable,1);

    myPlan.then((noPlan) => {
      expect(noPlan.done).to.be.true;
      done();
    })
    .catch(done);

  });

  it("should solve hanoi", function(done){
    var actions = [
      {
        action: "position1",
        possible:function(state, history){
          return state.get("stack1").get(0) < state.get("stack2").get(0) ||
            (state.get("stack1").get(0) !== undefined && state.get("stack2").get(0) === undefined) ||
            state.get("stack1").get(0) < state.get("stack2").get(0) ||
              (state.get("stack1").get(0) !== undefined && state.get("stack2").get(0) === undefined);
        },
        updateState: function(state){
          var stack1  = state.get("stack1");
          var v1 = stack1.get(0);
          var newState = state.set("stack1", stack1.shift());
          var stack2 = state.get("stack2");
          newState = newState.set("stack2", stack2.unshift(v1));
          return newState
        }
      },
      {
        action: "position1_to_position2",
        possible:function(state, history){
          return state.get("stack1").get(0) < state.get("stack2").get(0) ||
            (state.get("stack1").get(0) !== undefined && state.get("stack2").get(0) === undefined);
        },
        updateState: function(state){
          var stack1  = state.get("stack1");
          var v1 = stack1.get(0);
          var newState = state.set("stack1", stack1.shift());
          var stack2 = state.get("stack2");
          newState = newState.set("stack2", stack2.unshift(v1));
          return newState
        }
      },
      {
        action: "position1_to_position3",
        possible:function(state, history){
          return state.get("stack1").get(0) < state.get("stack3").get(0) ||
             (state.get("stack1").get(0) !== undefined && state.get("stack3").get(0) === undefined) ;
        },
        updateState: function(state){
          var stack1  = state.get("stack1");
          var v1 = stack1.get(0);
          var newState = state.set("stack1", stack1.shift());
          var stack3 = state.get("stack3");
          newState = newState.set("stack3", stack3.unshift(v1));
          return newState
        }
      },
      {
        action: "position2_to_position1",
        possible:function(state, history){
          return state.get("stack2").get(0) < state.get("stack1").get(0) ||
            (state.get("stack2").get(0) !== undefined && state.get("stack1").get(0) === undefined) ;
        },
        updateState: function(state){
          var stack2  = state.get("stack2");
          var v2 = stack2.get(0);
          var newState = state.set("stack2", stack2.shift());
          var stack1 = state.get("stack1");
          newState = newState.set("stack1", stack1.unshift(v2));
          return newState
        }
      },
      {
        action: "position2_to_position3",
        possible:function(state, history){
          return state.get("stack2").get(0) < state.get("stack3").get(0) ||
            (state.get("stack2").get(0) !== undefined &&  state.get("stack3").get(0) === undefined);
        },
        updateState: function(state){
          var stack2  = state.get("stack2");
          var v2 = stack2.get(0);
          var newState = state.set("stack2", stack2.shift());
          var stack3 = state.get("stack3");
          newState = newState.set("stack3", stack3.unshift(v2));
          return newState
        }
      },
      {
        action: "position3_to_position1",
        possible:function(state, history){
          return state.get("stack3").get(0) < state.get("stack1").get(0) ||
            (state.get("stack3").get(0) !== undefined &&  state.get("stack1").get(0) === undefined);
        },
        updateState: function(state){
          var stack3  = state.get("stack3");
          var v3 = stack3.get(0);
          var newState = state.set("stack3", stack3.shift());
          var stack1 = state.get("stack1");
          newState = newState.set("stack1", stack1.unshift(v3));
          return newState
        }
      },
      {
        action: "position3_to_position2",
        possible:function(state, history){
          return state.get("stack3").get(0) < state.get("stack2").get(0) ||
            (state.get("stack3").get(0) !== undefined && state.get("stack2").get(0) === undefined );
        },
        updateState: function(state){
          var stack3  = state.get("stack3");
          var v3 = stack3.get(0);
          var newState = state.set("stack3", stack3.shift());
          var stack2 = state.get("stack2");
          newState = newState.set("stack2", stack2.unshift(v3));
          return newState
        }
      }
    ];
    var isHanoi = function(state){
      return state.get("stack3").get(0) === 0 && state.get("stack3").get(1) === 1 && state.get("stack3").get(2) === 2;
    }

    var myPlan = plan(actions, {stack1:[0,1,2], stack2:[], stack3:[]}, isHanoi, 7);

    //var firstPlan = myPlan.next();
    myPlan.then((firstPlan) => {
      expect(firstPlan.value.length).to.equal(7);
      done();
    })
    .catch(done)

  });

  it("should handle multiple state returns", function(done){
    var actions = [
      {
        action: "act1",
        possible:function(state, history){
          return true;
        },
        updateState: function(state){
          return [state.set("act1_changed_state", true), state.set("act2_changed_state", true)];
        }
      }
    ];

    var myPlan = plan(actions, {}, isAcceptable,2);

    myPlan.then((nextPlan) => {
      expect(nextPlan.value.length).to.equal(2);
      expect(nextPlan.value[0].actionObj.action).to.equal("act1");
      expect(nextPlan.value[1].actionObj.action).to.equal("act1");
      return nextPlan.continue();
      //done();
    })
    .then((nextPlan) => {
      expect(nextPlan.value.length).to.equal(2);
      expect(nextPlan.value[0].actionObj.action).to.equal("act1");
      expect(nextPlan.value[1].actionObj.action).to.equal("act1");
      return nextPlan.continue();
    })
    .then((nextPlan) => {
      expect(nextPlan.done).to.be.true;
      done();
    })
    .catch(done)
  });
});
