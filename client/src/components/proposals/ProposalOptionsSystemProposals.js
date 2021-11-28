import React, { useState } from 'react'; 
import { InputGroup, FormControl } from 'react-bootstrap'; 

export default function ProposalOptionsSystemProposals({action, register}) { // creates a form box for inputs that users can choose
    const getType = action => {
        // will add validation rules later
        switch(action){
            case 'upgradeTo':
                return {type: 'text', placeholder: "New Address"};
            case 'updateTimelock':
                return {type: 'text', placeholder: "New Address"};
            default: 
                return {type: 'number', placeholder: action.replace(/(set)|(update)/, "set ").toLowerCase()};
        }
    }


    return (
            action ? 
            <>
                <InputGroup className="mt-2">
                    <InputGroup.Text>Type</InputGroup.Text>
                    <FormControl type={'textarea'} aria-label={'Type'} placeholder="System Proposal" value="System Proposal" disabled/>
                </InputGroup>

                <InputGroup className="mt-2">
                    <InputGroup.Text>Title</InputGroup.Text>
                    <FormControl type={'textarea'} aria-label={'Title'} placeholder={'set a short title'} {...register('title')} />
                </InputGroup>

                <InputGroup className="mt-2">
                    <InputGroup.Text>Description</InputGroup.Text>
                    <FormControl type={'textarea'} aria-label={'Description'} placeholder={'describe your proposal'} {...register('description')} />
                </InputGroup>
                
                <InputGroup className="mt-2">
                    <InputGroup.Text>{
                    action.replace(/(set)|(update)/, "").toUpperCase()[0] + action.replace(/(set)|(update)/, "").toLowerCase().slice(1) 
                    }</InputGroup.Text>
                    <FormControl 
                        type={getType(action).type} 
                        aria-label={action} 
                        placeholder={getType(action).placeholder} 
                        {...register(action)} 
                    />
                </InputGroup>
            </>
            :
            null
    )
}
