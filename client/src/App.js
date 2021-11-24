import React from 'react'; 
import { Routes, Route, BrowserRouter as Router} from 'react-router-dom';



// pages 
import Header from'./components/Header';
import Home from './pages/home/index';
import ProposalsIndex from './pages/proposals/index';
import ProposalSingleIndex from './pages/proposals/ProposalSingleIndex';
import ProposalCreateIndex from './pages/proposals/ProposalCreateIndex';
import NFTSIndex from './pages/nfts/index';
import VectorsIndex from './pages/vectors/index';


export default function App() {
    // const message = useAppContext().message;
    return (
        <Router>
            <Header /> 
            <Routes>
                <Route path='/' element={<Home />}></Route>
                <Route path='/proposals' element={<ProposalsIndex />}/>
                    {/* <Route path ="" element={<ProposalsList />} /> */}
                <Route path="/proposals/:proposalId" element={<ProposalSingleIndex />}/>
                <Route path="/proposals/create" element={<ProposalCreateIndex />}/>
                <Route path='/nfts' element={<NFTSIndex />}></Route>
                <Route path='/vectors' element={<VectorsIndex />}></Route>
                <Route path="/*" element={<h1 style={{marginTop: '10rem'}}>Oops! page does not exist</h1>} />
            </Routes>
        </Router>
    )
}
