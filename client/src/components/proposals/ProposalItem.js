import React from 'react';
import { Link } from 'react-router-dom'; 
import { Card, Badge, Container, Button  } from 'react-bootstrap';
import { shortenAddress } from '../../utils/shortenAddress'; 
import { useProposalInformation } from '../../hooks/useProposalInformation';
import { proposalStates } from '../../helpers/proposalStates';

// for handling queueing and execution of proposal
import daoArtifact from '../../contracts/IkonDAO.json';
import { useContract } from '../../hooks/useContract';
import { callContract } from '../../helpers/transactor';

export default function ProposalItem({id, type, title, description, value, proposor, proposals, setLoaded }) {
    
    const states = proposalStates;
    const { state } = useProposalInformation(id);
    const proxy = useContract(process.env.PROXY_CONTRACT, daoArtifact.abi);
    
    const handleQueue = () => {
        // handleExecute
        const {targets, calldatas, values, descriptionHash } = proposals.get(id).call;
        const queCallData = proxy.methods.queue(targets, values, calldatas, descriptionHash).encodeABI();
        alert(`queueing proposal with id ${shortenAddress(id)}`);
        callContract(process.env.PROXY_CONTRACT, queCallData).then(({transactionHash}) => {
            alert("transaction mined!");   
            alert(`hash: ${transactionHash}`);   
            alert("proposal queued!");   
        }).catch(e => alert(`code: ${e.code}, message: ${e.message}`));
        setLoaded(false);
    }
    
    const handleExecute = ()=>{
        // handleExecute 
        const {targets, calldatas, values, descriptionHash } = proposals.get(id).call;

        const executeCallData = proxy.methods.execute(targets, values, calldatas, descriptionHash).encodeABI();
        alert(`executing proposal with id ${shortenAddress(id)}`);
        callContract(process.env.PROXY_CONTRACT, executeCallData).then(({transactionHash}) => {
            alert("transaction mined!");   
            alert(`hash: ${transactionHash}`);
            alert("proposal executed!");   
        }).catch(e => alert(`code: ${e.code}, message: ${e.message}`));
        setLoaded(false);
    }


    return (

        <Container className="proposalItem" style={{padding: "2rem 0rem"}}  as="div" fluid>
            {
                state ? 
                <Card >
                <Card.Header as='div'  className="d-flex">
                        <div className="d-flex flex-column justify-content-start">
                            <Badge className="mt-2" bg={state ? states[state].color : null} style={{width: "85%"}} >{state ? states[state].text : "..loading"}</Badge>
                            <Badge className="mt-2" >{type}</Badge>
                            <Badge className="mt-2" >{shortenAddress(id)}</Badge>
                            <Badge className="mt-2" >{proposor}</Badge>
                        </div>
                        <div style={{width: "100%", height: "40%"}} className="d-flex justify-content-end">
                            { state && proposalStates[state].text === 'Succeeded' || state && proposalStates[state].text === 'Queued'?  
                                <div className="d-flex">
                                    <Button onClick={handleQueue} className="me-3" variant="info" disabled={state && proposalStates[state].text === 'Succeeded' ? false : true}>Queue Proposal</Button> 
                                    <Button onClick={handleExecute} variant="success" disabled={state && proposalStates[state].text === 'Queued' ? false : true}>Execute Proposal </Button> 
                                </div> :
                                null
                            }
                        </div>
                </Card.Header>
                <Card.Body className="mt-2">
                    <Card.Title>{title}</Card.Title>
                    <Card.Text>
                        { description }
                </Card.Text>
                <div>
                <h6>Proposed Change: </h6>
                {
                    value ? value.map((v, i) => (
                        <span style={{display: "block", fontSize: '0.8rem'}} key={i}>
                            <b>{v[0]}:</b> {v[1]}
                        </span>
                    ))
                    : null 
                }
                </div>
                    <Link to={`/proposals/${id}`} state={{proposals: proposals}} >Info</Link>
                </Card.Body>
            </Card>
            : <h2>...gathering data</h2>
        }
        
        </Container>
    )
}
