var uuid = require("uuid");
var Immutable = require("immutable");

function *plan(actions, initialState, isAcceptable, maxDepth){
  yield* _plan(actions, {}, [Immutable.fromJS(initialState)], isAcceptable, 0, maxDepth || 10);
}

function *_plan(actions, history, layerStates, isAcceptable, depth, maxDepth){

  if(depth === maxDepth){
    return;
  }
  for(var i = 0; i < layerStates.length; i++){
    if(isAcceptable(layerStates[i])){
      yield extractActions(layerStates[i].get("_$id"), history);
    }
  }

  var possibles = [];
  var newLayerStates = [];
  for(var i in actions){
    var action = actions[i];
    for(var j = 0; j < layerStates.length; j++){
      var activeState = layerStates[j];
      if(action.possible(activeState, history)){
        var newState = action.updateState(activeState, history);
        newerState = newState.set("_$id", uuid.v4());
        newLayerStates.push(newerState);
        possibles.push({
          actionObj:action,
          state:newerState,
          prevStateId: activeState.get("_$id")
        });
      }
    }
  }

  for(var i = 0; i < possibles.length; i++){
    history[possibles[i].state.get("_$id")] = possibles[i];
  }

  yield* _plan(actions, history, newLayerStates, isAcceptable, depth+1, maxDepth);
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
