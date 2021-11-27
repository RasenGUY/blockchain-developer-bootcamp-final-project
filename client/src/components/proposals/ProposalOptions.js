import React, { useState } from 'react'; 
import { InputGroup, FormControl } from 'react-bootstrap'; 

export default function ProposalOptions({action, register}) { // creates a form box for inputs that users can choose

    return (
            action ? 
            <InputGroup>
                <InputGroup.Text>{action.replace(/(set)|(update)/, "").toLowerCase()}</InputGroup.Text>
                <FormControl aria-label={action} placeholder={action.replace(/(set)|(update)/, "set ").toLowerCase()} {...register(action)} />
            </InputGroup>
            :
            null
    )
}
