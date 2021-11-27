import React, {useState, useEffect} from 'react'
import { useForm } from 'react-hook-form';
import { Form, Button, InputGroup } from 'react-bootstrap';

// for creating proposals
import ProposalOptions from './ProposalOptions';
import { createProposalAction } from '../../helpers/createProposal';

export default function SystemProposalForm() {
    const { register, handleSubmit, watch} = useForm();

    const watchAction = watch('action', "setVotingPeriod"); 
    
    const onSubmit = (data) => {
        // console.log() 
        console.log(createProposalAction(watchAction, data[watchAction], "some shitty description"));
    }
    
    // type --> system
    // select options 
        // set voting period governor
        // set voting delay governor
        // set token reward token
        // set voteReward votes
        // set timeLock delay timelocker
        // change timelocker address governor
    
    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group>
                <h2>System Proposals</h2>
                <h3>Select proposal</h3>
            </Form.Group>

            <Form.Group>
                <Form.Select {...register("action")} aria-label="Default select example">
                    <option value="setVotingPeriod">change dao voting period</option> 
                    <option value="setVotingDelay">change dao voting delay</option>
                    <option value="setBaseReward">change token rewards</option>
                    <option value="setRewardVotes">change reward for votes</option>
                    <option value="setTimelockDelay">change delay for the timelocker</option>
                    <option value="updateTimelock">change timelocker address</option>
                    <option value="upgradeTo">upgrade dao</option>
                </Form.Select>
            </Form.Group>
            
            {/* display inputs based on proposal value */}
            <Form.Group> 
                <ProposalOptions action={watchAction} register={register}/>

            </Form.Group> 
            
            <Button className="callout-button" type="submit">Propose</Button>
        </Form>    
    )
}
