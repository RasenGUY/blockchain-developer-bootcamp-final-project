// some helper functions for calculating bignumbers
const { replace } = require("lodash");
// const BN = require("big.js");
const web3 = require("web3");
const BN = web3.utils.BN;


// from normal number to bn
exports.toUnit = res => new BN(String(res)).div(new BN(String(1e18))).toNumber();
exports.unitToBN = num => new BN(String(num * 1e18));
exports.toNumber = res => new BN(String(res)).toNumber();
exports.toBN = num => new BN(String(num));
/// for fakeMining items
exports.fakeMine = async (fakeMine, actions, miningLength, options = undefined) => {

    let results = [];
    let counter = 0;
    for (let i = 0; i < miningLength; i++){
            
            if (actions.filter(action => action.height === i).length != 0){
                
                let result, error;
                try {
                        result = await actions[counter].callback();
                } catch (e){

                        error = e;
                }
                if (options != undefined && options.log === true){
                        if (options.actionNumber.h != undefined && options.actionNumber.h === i){
                                options.actionNumber.wrapper(result);
                        } 
                        if (options.actionNumber.length != undefined && options.actionNumber.filter(action => action.h === i).length != 0){
                                options.actionNumber.filter(action => action.h === i)[0].wrapper(result);
                        }
                                
                } 
                results.push(error ? {r: result, e: error} : result);
                counter++; 
            } 
            await fakeMine();       
    }
    return results; 
} 
exports.extractEventSignatures = abi => abi.filter( obj => (obj.type === 'event'));

exports.generateMappingsFromSignatures = objSigs => { 
        
        let sigMap = new Map();

        for(let i = 0; i < objSigs.length; i++){
                if (objSigs[i] && objSigs[i].name && objSigs[i].signature){
                        sigMap.set(objSigs[i].name, [objSigs[i].signature]);
                }
        }
        return sigMap;
}

exports.subscribeToLogs = (address, topics, web3, type) => web3.eth.subscribe(
        type, 
        {address: address, topics: topics}, 
        (error, result) => !error ? console.log(result) : console.log(error) 
        ) 
