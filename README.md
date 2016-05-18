
# Forward-Chainer

----

## What is forward chaining?
see [Wikipedia](https://en.wikipedia.org/wiki/Forward_chaining)

> Forward chaining is one of the two main methods of reasoning when using an inference engine and can be described logically as repeated application of modus ponens. Forward chaining is a popular implementation strategy for expert systems, business and production rule systems.

## Description

This module returns a generator that yields plans based on an Array of actions, an initial state, and an Acceptor function.  It takes advantage of Immutable Js's Maps in order to produce new states that are derived from invoking actions.
The planner executes in a Breadth First manner ie the shortest plans are produced first and will only get longer as the planner continues to generate.
This module does use generators so make sure if you plan to use it in the browser make sure its only on ES6 compatible browsers.

## Usage

### plan(Array<Actions> actions, Object initialState, function(ImmutableJsMap) -> bool isAcceptable, integer(optional defaults to 10) maxDepth) -> generator<Array<PlanNode>>

plan returns a generator that produces arrays of PlanNodes.  These nodes in order from start to finish contain the information that will produce the acceptable results.

```
var plan = require("forward-chainer");

var myPlanGenerator = plan(myActions, myInitialState, isAcceptable, myMaxDepth);

//For one plan
var myFirstPlan = myPlanGenerator.next();
myFirstPlan.value //<-- equals first accepted plan

//For all plans
var allPlans = [];
for(var myPlan of plan(myActions, myInitialState, isAcceptable, myMaxDepth)){
  allPlans.push(myPlan);
}

allPlans //<-- an array of every possible plan

```

### planAsync(Array<Actions> actions, Object initialState, function(ImmutableJsMap) -> Promise(bool) isAcceptable, integer(optional defaults to 10) maxDepth) -> Promise(Continuation(PlanNode))

plan returns a promise that produces continuations of PlanNodes.  These nodes in order from start to finish contain the information that will produce the acceptable results.  This implementation can accept actions that return Promises rather than synchronous values and isAcceptable can return a promise as wells.

```
var plan = require("forward-chainer").planAsync;

var myPlan = plan(myActions, myInitialState, isAcceptable, myMaxDepth);

myPlan.then((firstPlan) => {
  firstPlan.value //<-- equals firstPlan
  return firstPlan.continue();
})
.then((nextPlan) => {
  nextPlan.value //<--equals secondPlan
})

```

### Creating Actions

Actions must implement 2 functions

Note: Its very useful to implement a do function as well, since the action will be returned in the plan but it is not necessary

### possible(ImmutableJsMap currentState, Array<PlanNode> history) -> bool

The possible function is used to detect whether an action is possible based on current state.
History is an array of PlanNodes executed from start to current

```
possible : function(currentState, history){
  var previousPlanObject = history[history.length - 1];
  //if previousPlanObject === undefined then there was no previous action and was derived from initial state
  var previousAction = previousPlanObject.action;
  return (some boolean conditional statement);
}
```

### updateState(ImmutableJsMap currentState, Array<PlanNode> history) -> ImmutableJsMap

The updateState function takes currentState and history and produces a new state.  Note Immutable Js will create new objects whenever a property is changed and will NOT contaminate the current state.

```
updateState : function(currentState, history){
  var newState = currentState.set("myChange", "Some Data");
  return newState;
}
```

### PlanNode

Plan Node is an object with the following properties
### actionObj
actionObj is the Action that will fulfill the current plan if executed in the correct
### state
state is an ImmutableJs Map and is the state that is expected to be produced by the action in the current node
### prevStateId
prevStateId is a string that links it to the previous node, if it is undefined then there is no previous node and it is the first action.

## Example

### Tower of Hanoi
see [Wikipedia](https://en.wikipedia.org/wiki/Tower_of_Hanoi)

```
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

var firstPlan = myPlan.next();

//Run it yourself to see the results.  Note: it is also in the test file
```
