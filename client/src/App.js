import React from 'react'; 
import { useAppContext } from './AppContext';  

export default function App() {
    const message = useAppContext().message;
    return (
        <div>
            <h1> { message}</h1>
        </div>
    )
}
