

exports.fakeMine = async (fakeMine, actions, miningLength, options = undefined) => {

        let results = [];
        let counter = 0;
        for (let i = 0; i < miningLength; i++){
                
                if (actions.filter(action => action.height === i).length != 0){
                        
                        let result = await actions[counter].callback();
                        if (options != undefined && options.log === true){
                                if (options.actionNumber.h != undefined && options.actionNumber.h === i){
                                        options.actionNumber.wrapper(result);
                                } 
                                if (options.actionNumber.length != undefined && options.actionNumber.filter(action => action.h === i).length != 0){
                                        options.actionNumber.filter(action => action.h === i)[0].wrapper(result);
                                }
                                        
                        } 
                        results.push(result);
                        counter++; 
                } 
                await fakeMine();       
        }
        return results; 
} 