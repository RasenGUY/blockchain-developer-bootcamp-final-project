import React, {useState, useEffect} from 'react'
import { useForm } from 'react-hook-form';
import { Form, Button } from 'react-bootstrap';
 
// for creating proposals
import ProposalOptionsDAOProposals from './ProposalOptionsDAOProposals';
import { createProposalAction, } from '../../helpers/createProposal';
import { useContract } from '../../hooks/useContract';
import governorArtifact from '../../contracts/IkonDAOGovernor.json';
import daoArtifact from '../../contracts/IkonDAO.json';
import { toSha3 } from '../../utils/utils';
import { callContract } from '../../helpers/transactor';

// for storage
const slug = require('unique-slug');
import { useAppContext } from '../../AppContext';

export default function DAOProposalForm() {
    const { updateProposals } = useAppContext(); 
    const { 
        control,
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
    // slashVotes
    // banMember

    // create governorInst for hashing proposal and proxy inst for calling propose
    const governor = useContract(process.env.GOVERNOR_CONTRACT, governorArtifact.abi);
    const proxy  = useContract(process.env.PROXY_CONTRACT, daoArtifact.abi);

    const onSubmit = async (data) => {
        // create a proposalAction
        console.log(data[watchAction]);

        // let proposalData;
        // if (watchAction === 'slashVotes'){
        //     const inputs = {
        //         target: data[watchAction].Member,
        //         value: data[watchAction].Votes
        //     };
        //     proposalData = createProposalAction(watchAction, inputs, slug() + data.description);
        // } else {
        //     proposalData = createProposalAction(watchAction, data[watchAction], slug() + data.description)
        // }
        // const {targets, description, calldatas, values} = proposalData; 
        
        // // get proposal id from action values
        // const proposalId = await governor.methods.hashProposal(targets, values, calldatas, toSha3(description)).call();

        // // // for storage of proposal 
        // const storageObject = {
        //     id: proposalId, 
        //     type: data.type,
        //     title: data.title, 
        //     description: data.description, 
        //     value: watchAction === 'slashVotes' ? [data[watchAction].Member, data[watchAction].Votes] : data[watchAction], 
        //     proposor: window.ethereum.selectedAddress
        // }
        
        // // propose workflow 
        // let proposeCallData = proxy.methods.propose(targets, values, calldatas, description).encodeABI();
        // callContract(process.env.PROXY_CONTRACT, proposeCallData).then(async receipt => {
        //     console.log("transaction mined", receipt);
        //     console.log("stored proposal on ipfs")
        //     updateProposals(storageObject);
        // }).catch(e=> console.log(e));
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
