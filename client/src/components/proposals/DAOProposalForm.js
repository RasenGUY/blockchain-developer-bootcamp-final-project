import React, {useState, useEffect} from 'react'
import { useForm } from 'react-hook-form';
import { Form, Button } from 'react-bootstrap';
 
// for creating proposals
import ProposalOptionsDAOProposals from './ProposalOptionsDAOProposals';
import { createProposalAction, } from '../../helpers/createProposal';
import { useContract } from '../../hooks/useContract';
import governorArtifact from '../../contracts/IkonDAOGovernor.json';
import daoArtifact from '../../contracts/IkonDAO.json';
import { toSha3, stringToHex } from '../../utils/utils';
import { callContract } from '../../helpers/transactor';

// for storage
const slug = require('unique-slug');
import { useAppContext } from '../../AppContext';
import { useGraphics } from '../../hooks/useGraphics';
import { storeFiles, initializeData, listUploads } from '../../web3-storage/ipfsStorage';

export default function DAOProposalForm() {
    const { updateProposals, updateGraphics } = useAppContext(); 
    const [loaded, setLoaded] = useState();
    const graphics = useGraphics(setLoaded); // initially load graphics, but only for dao proposals

    const { 
        register, 
        handleSubmit, 
        watch,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            type: 'DAO Proposal'
        }
    });


    const watchAction = watch('action', "safeMintVector"); 

    // create governorInst for hashing proposal and proxy inst for calling propose
    const governor = useContract(process.env.GOVERNOR_CONTRACT, governorArtifact.abi);
    const proxy  = useContract(process.env.PROXY_CONTRACT, daoArtifact.abi);

    const onSubmit = async (data) => {
        // create a proposalAction

        let proposalData;
        let vectorData;
        if (watchAction === 'safeMintVector'){
            // creates object to store vector data  
            vectorData = {};
            proposalData = {};
            let file = data[watchAction].uploadedFiles[0];
            
            vectorData.status = 1;
            vectorData.type = 'freebie'; 
            vectorData.description = data[watchAction].ImageDescription 
            vectorData.image = await storeFiles([file], `${slug()}-file-${file.name}`);
            vectorData.external_url = `https://${vectorData.image}.ipfs.dweb.link`;
            vectorData.name = data[watchAction].ImageTitle
            vectorData.category = data[watchAction].ImageCategory
            vectorData.artistHandle = data[watchAction].Handle; 
        
            // create proposal information for blockchain storage 
            proposalData = createProposalAction(
                watchAction, 
                {
                    nft: {
                        category: toSha3(vectorData.category),
                        imageHash: vectorData.image, // update to accept imageHash as is instead of string type
                    }, 
                    proposer: data[watchAction].RewardsAddress
                }, 
                slug() + data.description
            );
            
            // extracts proposalId for vectorData info
            const {targets, values, calldatas, description} = proposalData;
            const proposalId = await governor.methods.hashProposal(targets, values, calldatas, toSha3(description)).call(); 
            vectorData.proposalId = proposalId;

        } else {
            const input = watchAction.replace(/(set)|(update)/, "").toUpperCase()[0] + watchAction.replace(/((T|t)okens)|((V|v)otes)/, "").toLowerCase().slice(1) + "sAddress"
            proposalData = createProposalAction(watchAction, data[watchAction][input], slug() + data.description)
        }

        // get proposal id from action values
        const {targets, description, calldatas, values} = proposalData; 
        const proposalId = await governor.methods.hashProposal(targets, values, calldatas, toSha3(description)).call();
        
        // for storage of proposal 
        const storageObject = {
            id: proposalId, 
            type: data.type,
            title: data.title, 
            description: data.description, 
            value: watchAction === 'safeMintVector' 
            ? [['RewardsAddress', data[watchAction]['RewardsAddress']], [ 'Image url', vectorData.external_url ], ['CID', vectorData.image ] ]
            : Object.entries(data[watchAction]), 
            proposor: window.ethereum.selectedAddress,
            call: {
                targets: targets, 
                calldatas: calldatas, 
                values: values, 
                descriptionHash: toSha3(description)
            }
        }
        
        // propose workflow 
        let proposeCallData = proxy.methods.propose(targets, values, calldatas, description).encodeABI();
        callContract(process.env.PROXY_CONTRACT, proposeCallData).then(async ({transactionHash}) => {
            
            let images = await listUploads('graphics');
            let proposals = await listUploads('proposals');
            alert(`transaction mined transaction hash: ${transactionHash}`);
            if (watchAction === 'safeMintVector'){
                
                if (images.length < 1){
                    alert("initializing ipfs storage for images");    
                    await initializeData('graphics', [vectorData]);
                    alert("graphics initialized");    

                } else {
                    alert("updating graphics on ipfs");    
                    if(!loaded) await setGraphics();
                    await updateGraphics(vectorData);
                    alert("graphics updated");    
                }
                alert("stored vector information on ipfs");
            }
            if (proposals.length < 1){
                alert("initializing ipfs storage for proposals");
                await initializeData('proposals', [storageObject]);
            } else {
                await updateProposals(storageObject);
            }
            alert("proposal created sucessfully");
        });
    }
    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group>
                <h2>DAO Proposal</h2>
            </Form.Group>

            <Form.Group>
                <Form.Text><h4>Select Proposal</h4></Form.Text>
                <Form.Select {...register("action")} aria-label="Select Proposal">
                    <option value="safeMintVector">Mint a vector</option> 
                    <option value="rewardVotes">Reward votes to someone</option>
                    <option value="rewardTokens">Reward tokens to someone</option>
                </Form.Select>
            </Form.Group>
            
            {/* display inputs based on proposal value */}
            <Form.Group className="mb-2"> 
                <ProposalOptionsDAOProposals action={watchAction} register={register}/>
            </Form.Group> 
            
            <Button className="callout-button" type="submit">Propose</Button>
        </Form>    
    )
}
