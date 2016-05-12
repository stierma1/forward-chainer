var Immutable = require("immutable");

function *plan(actions, initialState, isAcceptable, maxDepth){
  yield* _plan(actions, [], Immutable.fromJS(initialState), isAcceptable, 0, maxDepth || 10);
}

function *_plan(actions, history, currentState, isAcceptable, depth, maxDepth){
  if(isAcceptable(currentState)){
    yield history.concat([]); //extractActions(layerStates[i].get("_$id"), history);
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
