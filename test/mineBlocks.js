

exports.fakeMine = async (fakeMine, actions, miningLength, options = undefined) => {

        let results = [];
        let counter = 0;
        for (let i = 0; i < miningLength; i++){
                
                if (actions.filter(action => action.height === i).length != 0){
                        
                        let result = await actions[counter].callback();
                        if (options != undefined && options.log === true && i === options.actionNumber){
                                console.log(result);
                        }
                        results.push(result);
                        counter++; 
                } 
                await fakeMine();       
        }
        return results; 
} 