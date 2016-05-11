var plan = require("../lib/plan");
var chai = require("chai");
var expect = chai.expect;

var isAcceptable = function(state){
  return state.get("act1_changed_state") && state.get("act2_changed_state");
}

describe("plan", function(){

  it("should return a plan", function(){
    var actions = [
      {
        action: "act1",
        possible:function(state, history){
          return true;
        },
        updateState: function(state){
          return state.set("act1_changed_state", true);
        }
      },
      {
        action: "act2",
        possible:function(state, history){
          return true;
        },
        updateState: function(state){
          return state.set("act2_changed_state", true);
        }
      }
    ];

    var myPlan = plan(actions, {}, isAcceptable);

    var firstPlan = myPlan.next();

    expect(firstPlan.value.length).to.equal(2);
    expect(firstPlan.value[0].actionObj.action).to.equal("act2");
    expect(firstPlan.value[1].actionObj.action).to.equal("act1");
  });

  it("should return a plan only if actions are possible", function(){
    var actions = [
      {
        action: "act1",
        possible:function(state, history){
          return true;
        },
        updateState: function(state){
          return state.set("act1_changed_state", true);
        }
      },
      {
        action: "act2",
        possible:function(state, history){
          return state.get("act1_changed_state");
        },
        updateState: function(state){
          return state.set("act2_changed_state", true);
        }
      }
    ];

    var myPlan = plan(actions, {}, isAcceptable);

    var firstPlan = myPlan.next();

    expect(firstPlan.value.length).to.equal(2);
    expect(firstPlan.value[0].actionObj.action).to.equal("act1");
    expect(firstPlan.value[1].actionObj.action).to.equal("act2");
  });

  it("should iterate to get all possible plans", function(){
    var actions = [
      {
        action: "act1",
        possible:function(state, history){
          return true;
        },
        updateState: function(state){
          return state.set("act1_changed_state", true);
        }
      },
      {
        action: "act2",
        possible:function(state, history){
          return true;
        },
        updateState: function(state){
          return state.set("act2_changed_state", true);
        }
      }
    ];

    for(var myPlan of plan(actions, {}, isAcceptable,2)){
      expect(myPlan.value.length).to.equal(2);
      expect(myPlan.value[0].actionObj.action).to.equal("act2");
      expect(myPlan.value[1].actionObj.action).to.equal("act1");
    }
  });

  it("should halt if maxDepth is reached", function(){
    var actions = [
      {
        action: "act1",
        possible:function(state, history){
          return true;
        },
        updateState: function(state){
          return state.set("act1_changed_state", true);
        }
      },
      {
        action: "act2",
        possible:function(state, history){
          return true;
        },
        updateState: function(state){
          return state.set("act2_changed_state", true);
        }
      }
    ];

    for(var myPlan of plan(actions, {}, isAcceptable,1)){
      throw new Error("No plan should have been returned");
    }
  });

  it("should solve hanoi", function(){
    var actions = [
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

    var myPlan = plan(actions, {stack1:[0,1,2], stack2:[], stack3:[]}, isHanoi, 8);

    var firstPlan = myPlan.next();

    expect(firstPlan.value.length).to.equal(7);

  });
});
