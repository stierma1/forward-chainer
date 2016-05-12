var Immutable = require("immutable");

function *plan(actions, initialState, isAcceptable, maxDepth){
  maxDepth = maxDepth || 10;
  for(var i = 0; i <= maxDepth; i++){
    yield* _plan(actions, [], Immutable.fromJS(initialState), isAcceptable, 0, i);
  }
}

function *_plan(actions, history, currentState, isAcceptable, depth, maxDepth){
  if(depth === maxDepth && isAcceptable(currentState)){
    yield history.concat([]);
  }

  if(depth === maxDepth){
    return;
  }

  for(var i in actions){
    var action = actions[i];
    if(action.possible(currentState, history)){
      var newState = action.updateState(currentState, history);
      history.push({
        actionObj:action,
        state:newState
      });
      yield* _plan(actions, history, newState, isAcceptable, depth+1, maxDepth);
      history.pop();
    }
  }

}

module.exports = plan;
