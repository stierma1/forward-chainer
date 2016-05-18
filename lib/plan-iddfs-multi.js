var Immutable = require("immutable");

function *plan(actions, initialState, isAcceptable, maxDepth){
  maxDepth = maxDepth || 10;
  for(var i = 0; i <= maxDepth; i++){
    yield* _plan(actions, [], Immutable.fromJS(initialState), isAcceptable, 0, i);
  }
}

function *_plan(actions, history, currentState, isAcceptable, depth, maxDepth){
  if(depth === maxDepth){
    if(isAcceptable(currentState)){
      yield history.concat([]);
    }
    return;
  }

  for(var i in actions){
    var action = actions[i];
    if(action.possible(currentState, history)){
      var newStates = action.updateState(currentState, history);

      for(var i = 0; i < newStates.length; i++){
        history.push({
          actionObj:action,
          state:newStates[i]
        });
        yield* _plan(actions, history, newStates[i], isAcceptable, depth+1, maxDepth);
        history.pop();
      }
    }
  }

}

module.exports = plan;
