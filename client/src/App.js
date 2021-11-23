import React from 'react'; 
import { useAppContext } from './AppContext';  
import { Routes, Route, BrowserRouter as Router, useParams} from 'react-router-dom';

// header
import Header from './components/Header';

// pages 
import Home from './pages/home/index';
import ProposalsIndex from './pages/proposals/index';
import ProposalSingleIndex from './pages/proposals/singlepage/index';
import NFTSIndex from './pages/nfts/index';
import VectorsIndex from './pages/vectors/index';

// history
import history from './history';


export default function App() {
    const message = useAppContext().message;
    return (
        <Router history={history}>
            <Header /> 
            <Routes>
                <Route path='/' element={<Home />}></Route>
                <Route path='/proposals' element={<ProposalsIndex />}></Route>
                <Route path='/nfts' element={<NFTSIndex />}></Route>
                <Route path='/vectors' element={<VectorsIndex />}></Route>
                {/* <Route path='/proposals/:id' element={<ProposalSingleIndex />} ></Route> */}
            </Routes>
        </Router>
    )
}
