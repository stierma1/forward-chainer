var Immutable = require("immutable");

function *plan(actions, initialState, isAcceptable, maxDepth){
  yield* _plan(actions, [], [Immutable.fromJS(initialState)], isAcceptable, 0, maxDepth || 10, 0);
}

function *_plan(actions, history, layerStates, isAcceptable, depth, maxDepth, idx){
  var index = idx;
  for(var i = 0; i < layerStates.length; i++){
    if(isAcceptable(layerStates[i])){
      yield extractActions(layerStates[i].get("_$id"), history);
    }
  }

  if(depth === maxDepth){
    return;
  }

  var newLayerStates = [];
  for(var i in actions){
    var action = actions[i];
    for(var j = 0; j < layerStates.length; j++){
      var activeState = layerStates[j];
      if(action.possible(activeState, history)){
        var newState = action.updateState(activeState, history);
        newerState = newState.set("_$id", index++);
        newLayerStates.push(newerState);
        history[index - 1] = {
          actionObj:action,
          state:newerState,
          prevStateId: activeState.get("_$id")
        };
      }
    }
  }


  yield* _plan(actions, history, newLayerStates, isAcceptable, depth+1, maxDepth, index);
}

function extractActions(stateId, history){
  var actionHistory = [];
  var curStateId = stateId;

  while(history[curStateId]){
    actionHistory.push(history[curStateId]);
    curStateId = history[curStateId].prevStateId;
  }

  actionHistory.reverse();
  return actionHistory;
}

module.exports = plan;
