"use strict"
var Immutable = require("immutable");
var Continuation = require("continuations");

function plan(actions, initialState, isAcceptable, maxDepth){
  maxDepth = maxDepth || 10;

  var planContinuation = new Continuation(function* (){
      for(var i = 0; i <= maxDepth; i++){
        yield new Continuation(_plan, actions, [], Immutable.fromJS(initialState), isAcceptable, 0, i);
      }
  });

  return planContinuation.start();
}

function* _plan(actions, history, currentState, isAcceptable, depth, maxDepth){
  if(depth === maxDepth ){
    yield new Continuation(function* (){
      yield Promise.resolve(isAcceptable(currentState))
        .then((isAccept) => {
          if(isAccept){
            return history;
          }
          return Continuation.CONTINUE;
        })
    });
    return
  }

  for(var i = 0; i < actions.length; i++){
    var action = actions[i];
    yield new Continuation(function* (){
      yield Promise.resolve(action.possible(currentState, history))
        .then((isPoss) => {
          if(!isPoss){
            return Continuation.CONTINUE;
          }
          return Promise.resolve(action.updateState(currentState, history))
            .then((_newStates) => {
              if(_newStates instanceof Array){
                var newStates = _newStates;
                return new Continuation(function* (){
                  for(var idx = 0; idx < newStates.length; idx++){
                    var newState = newStates[idx];
                    yield new Continuation(_plan, actions, history.concat([{
                      actionObj:action,
                      state:newState
                    }]), newState, isAcceptable, depth+1, maxDepth);
                  }
                });
              }
              return new Continuation(_plan, actions, history.concat([{
                actionObj:action,
                state:_newStates
              }]), _newStates, isAcceptable, depth+1, maxDepth);

          })
        });
    });
  }
}

module.exports = plan;
