import React from 'react'; 
import { useAppContext } from './AppContext';  
import { Routes, Route, BrowserRouter as Router} from 'react-router-dom';

// header
import Header from './components/Header';

// pages 
import Home from './pages/home/index';
import ProposalsIndex from './pages/proposals/index';
import NFTSIndex from './pages/nfts/index';
import VectorsIndex from './pages/vectors/index';

export default function App() {
    const message = useAppContext().message;
    return (
        <Router>
            <Header /> 
            <Routes>
                <Route exact path='/' element={<Home />}></Route>
                <Route exact path='/proposals' element={<ProposalsIndex />}></Route>
                <Route exact path='/nfts' element={<NFTSIndex />}></Route>
                <Route exact path='/vectors' element={<VectorsIndex />}></Route>
            </Routes>
        </Router>
    )
}
