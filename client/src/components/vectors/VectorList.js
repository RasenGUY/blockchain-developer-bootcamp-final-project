import React from 'react';
import VectorCard from './VectorCard';
import { Container } from 'react-bootstrap';

export default function VectorList() {
// retrieve nft's from web3.storage
const nfts = {
    "asndfasdflkjsd 1" : {
        name: "some nft name 1",
        description: "some nft description 1",
        externalLink: "some nft externalink 1",
        category: "some nft category 1",
        handle: "some handle 1",
        type: "freebe",

    },
    "asndfasdflkjsd 2" : {
        name: "some nft name 2",
        description: "some nft description 2",
        externalLink: "some nft externalink 2",
        category: "some nft category 2",
        handle: "some handle 2",
        type: "freebe",

    },
    "asndfasdflkjsd 3" : {
        name: "some nft name 3",
        description: "some nft description 3",
        externalLink: "some nft externalink 3",
        category: "some nft category 3",
        handle: "some handle 3",
        type: "freebe",

    },
    "asndfasdflkjsd 4" : {
        name: "some nft name 4",
        description: "some nft description 4",
        externalLink: "some nft externalink 4",
        category: "some nft category 4",
        handle: "some handle 4",
        type: "freebe",

    },
    "asndfasdflkjsd 5" : {
        name: "some nft name 5",
        description: "some nft description 5",
        externalLink: "some nft externalink 5",
        category: "some nft category 5",
        handle: "some handle 5",
        type: "freebe",

    }
}

console.log(Object.entries(nfts)
.map(([hash, {name, description, externalLink, category, handle}]) => [hash, name, description, externalLink, category, handle]));

return (
        <Container className="d-flex flex-wrap" fluid>
        {   
            Object.entries(nfts).map(([hash, {name, description, externalLink, category, handle}]) => (
                <VectorCard 
                hash={hash}
                name={name}
                description={description}
                externalLink={externalLink}
                category={category}
                handle={handle} 
                />
                )
            )
        }
        </Container>
    )
}
