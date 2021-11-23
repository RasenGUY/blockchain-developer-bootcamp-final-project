import React from 'react';
import { Outlet } from 'react-router-dom'; 
import { Container } from 'react-bootstrap';
import ProposalList from '../../components/proposals/ProposalList';
import Helmet from 'react-helmet';
// header
import Header from './components/Header';

export default function ProposalsIndex() {
    return (
        <>
            <Helmet>
                <title>Proposals</title>
            </Helmet>
            <Header />
            <Container id="proposals" fluid>
                <ProposalList />
            </Container>
        </>        
    )
}
