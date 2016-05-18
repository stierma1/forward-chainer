var plan = require("../lib/plan-iddfs-multi");
var chai = require("chai");
var expect = chai.expect;

var isAcceptable = function(state){
  return state.get("act1_changed_state") && state.get("act2_changed_state");
}

describe("plan-iddfs-multistate", function(){

  it("should return a plan", function(){
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

    var firstPlan = myPlan.next();

    expect(firstPlan.value.length).to.equal(2);
    expect(firstPlan.value[0].actionObj.action).to.equal("act1");
    expect(firstPlan.value[1].actionObj.action).to.equal("act2");
  });

  it("should return a plan only if actions are possible", function(){
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

    for(var myPlan of plan(actions, {}, isAcceptable,2)){
      expect(myPlan.length).to.equal(2);
      if(myPlan[0].actionObj.action === "act1"){
        expect(myPlan[1].actionObj.action).to.equal("act2");
      } else {
        expect(myPlan[1].actionObj.action).to.equal("act1");
      }
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

    for(var myPlan of plan(actions, {}, isAcceptable,1)){
      throw new Error("No plan should have been returned");
    }
  });

})
