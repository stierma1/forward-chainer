"use strict"
var Immutable = require("immutable");

class Continuation{
  constructor(generator){
    var args = Array.from(arguments);
    args.shift();
    this._genArgs = args;
    this.generatorFunction = generator;
    this.generatorInstance = null;
    this.currentPromise = null;
    this.childContinuation = null;
    this.reset();

  }

  static CONTINUE(){

  }

  initGenerator(){
    this.generatorInstance = this.generatorFunction.apply(this, arguments);
    return this;
  }

  reset(){
    this.initGenerator.apply(this,this._genArgs);
  }

  start(){
    return this.continue();
  }

  continue(){

    if(this.childContinuation){
      var childData = this.childContinuation.continue();
        return Promise.resolve(childData)
          .then((cVal) => {
            if(!cVal.done){
              return Promise.resolve(cVal.value)
                .then((cVal2) => {
                  if(cVal2 === Continuation.CONTINUE){
                    return this.continue();
                  }
                  return {value:cVal2, continue:this.continue.bind(this), reset:this.reset.bind(this), done:cVal.done};
                });
            }
            this.childContinuation = null;
            return this.continue();
          });
    }
    
    this.currentPromise = Promise.resolve();
    var data = this.generatorInstance.next();
    return this.currentPromise.then(() => {
      //console.log(data)
      return Promise.resolve(data.value);
    })
    .then((val) => {
      if(!data.done && val instanceof Continuation){
        this.childContinuation = val;
        return this.continue();
      }
      if(val === Continuation.CONTINUE){
        return this.continue();
      }
      return {value:val, continue:this.continue.bind(this), reset:this.reset.bind(this), done:data.done}
    });
  }
}


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
    if(isAcceptable(currentState)){
      yield history;
    }
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
            .then((newState) => {
              var newCont = new Continuation(_plan);
              newCont.initGenerator(actions, history.concat([{
                actionObj:action,
                state:newState
              }]), newState, isAcceptable, depth+1, maxDepth);
              return newCont;
          })
        });
    });
  }
}

module.exports = plan;
