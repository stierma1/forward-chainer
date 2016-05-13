var plan = require("../lib/plan-iddfs-async");

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

var myPlan = plan(actions, {stack1:[0,1,2], stack2:[], stack3:[]}, isHanoi, 7);


myPlan.then(function(ans){
  console.log(ans)
  return ans.continue();
})
.then(function(ans){
  console.log(ans);
  ans.reset();
  ///return ans.continue(ans);
})
.then(function(ans){
  console.log(ans)
})
