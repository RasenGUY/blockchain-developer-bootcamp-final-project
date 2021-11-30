import {useState, useEffect} from 'react';
import { useAppContext } from '../AppContext';

// for retrieving tokenIds and validating nfts
import nftArtifact from '../contracts/IkonDAOVectorCollectible.json';
import { useContract } from './useContract';
import { mergeIpfsData } from '../web3-storage/ipfsStorage';

export function useGraphics(setLoaded) {
    const { setGraphics, graphics } = useAppContext();
    const nft = useContract(process.env.NFT_CONTRACT, nftArtifact.abi);
    
    useEffect(()=> {
        if (!graphics){
            setGraphics();
        }
        if(graphics){
                nft.methods.totalSupply().call()
                .then(tokens => {
                    for(let i = 0; i < tokens; i++){
                        nft.methods.getMetadata(i).call().then(async ({image}) => {
                            if(graphics.get(image) && graphics.get(image).type !== 'nft'){
                                let nftObj = graphics.get(image);
                                nftObj.status = 0; // sets status to processed 
                                nftObj.type = 'nft'; // sets type to nft
                                
                                // merge  
                                await mergeIpfsData('graphics', image, nftObj);
                                // setGraphics();
                                // setLoaded(true);
                            };
                        }).catch(e => console.log(e));
                    }
                }).catch(e => console.log(e));
                setLoaded(true);             
        }
    }, [graphics]);

    return graphics; 
}
