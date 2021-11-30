import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useForm } from 'react-hook-form';

  export default function CastVote() {
    
    // if member voted disable buttons
    const { register, handleSubmit } = useForm();
    const [result, setResult] = useState("");
    const onSubmit = ( data ) => setResult(JSON.stringify(data)); 
    
    return (
        <Form id="castVote" onSubmit={handleSubmit(onSubmit)}>
            <Form.Group>
                <h2>Cast your vote here</h2>
            </Form.Group>

            <Form.Group>
                <Form.Select {...register("option")} aria-label="Default select example">
                    <option value="0">Against</option>
                    <option value="1">For</option>
                    <option value="2">Abstain</option>
                </Form.Select>
            </Form.Group>

            <Button className="callout-button" type="submit">
                Vote
            </Button>
        </Form>    
    )
}
