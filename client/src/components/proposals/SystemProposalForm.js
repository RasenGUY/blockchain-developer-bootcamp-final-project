import React, {useState, useEffect} from 'react'
import { useForm } from 'react-hook-form';
import { Form, Button, InputGroup } from 'react-bootstrap';

// for creating proposals
import ProposalOptions from './ProposalOptions';
import { createProposalAction, } from '../../helpers/createProposal';
import { useContract } from '../../hooks/useContract';
import governorArtifact from '../../contracts/IkonDAOGovernor.json';
import daoArtifact from '../../contracts/IkonDAO.json';
import { toSha3 } from '../../utils/utils';
import { callContract } from '../../helpers/transactor';

// for storage
const slug = require('unique-slug');
import { useAppContext } from '../../AppContext';


export default function SystemProposalForm() {
    const {updateProposals: updateProposalsContext} = useAppContext(); 
    const { 
        control,
        register, 
        handleSubmit, 
        watch,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            type: 'System Proposal'
        }
    });
    const watchAction = watch('action', "setVotingPeriod"); 
    
    // create governorInst for hashing proposal and proxy inst for calling propose
    const governor = useContract(process.env.GOVERNOR_CONTRACT, governorArtifact.abi);
    const proxy  = useContract(process.env.PROXY_CONTRACT, daoArtifact.abi);

    const onSubmit = async (data) => {
        // create a proposalAction
        const {targets, description, calldatas, values} = createProposalAction(watchAction, data[watchAction], slug() + data.description);
        
        // get proposal id from action values
        const proposalId = await governor.methods.hashProposal(targets, values, calldatas, toSha3(description)).call();
        
        // for storage of proposal 
        const storageObject = {
            id: proposalId, 
            type: data.type,
            title: data.title, 
            description: data.description, 
            value: data[watchAction], 
            proposor: window.ethereum.selectedAddress
        }
        
        // propose workflow 
        let proposeCallData = proxy.methods.propose(targets, values, calldatas, description).encodeABI();
        callContract(process.env.PROXY_CONTRACT, proposeCallData).then(async receipt => {
            console.log("transaction mined", receipt);
            console.log("stored proposal on ipfs")
            updateProposalsContext(storageObject);

        }).catch(e=> console.log(e))
    }
        
    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group>
                <h2>System Proposals</h2>
            </Form.Group>

            <Form.Group>
                <Form.Text><h4>Select Proposal</h4></Form.Text>
                <Form.Select {...register("action")} aria-label="Select Proposal">
                    <option value="setVotingPeriod">Change DAO Voting Period</option> 
                    <option value="setVotingDelay">Change DAO Voting Delay</option>
                    <option value="setBaseReward">Change Token Rewards</option>
                    <option value="setRewardVotes">Change Reward For Votes</option>
                    <option value="setTimelockDelay">Change Delay For The Timelocker</option>
                    <option value="updateTimelock">Change Timelocker Address</option>
                    <option value="upgradeTo">Upgrade DAO To New Implementation</option>
                </Form.Select>
            </Form.Group>
            
            {/* display inputs based on proposal value */}
            <Form.Group className="mb-2"> 
                <ProposalOptions action={watchAction} register={register}/>
            </Form.Group> 
            
            <Button className="callout-button" type="submit">Propose</Button>
        </Form>    
    )
}
