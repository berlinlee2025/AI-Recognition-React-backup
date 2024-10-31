import React, { useEffect, useContext } from 'react';

// import Slideshow to display ColorRecords
import SlideshowAgeRecords from './Slideshow-AgeRecords/Slideshow-AgeRecords';
import "../records.scss";

import { UserContext } from '../../../shared/context/user-context';

// Parent component
// src/App.js
// Child component
// src/components/Records/AgeRecords/Slideshow-AgeRecords/Slideshow-AgeRecords.jsx
const AgeRecords = ({dimensions, userAgeRecords}) => {
    const userContext = useContext(UserContext);
    
    return (
        <React.Fragment>
            {/* <CheckRecordsPanel /> */}
            <div className="container frosted">
            <h1 className="recordsHeading frosted__children">Age Records</h1>
            <SlideshowAgeRecords 
                user={userContext.user} 
                isSignedIn={userContext.isSignedIn} 
                dimensions={dimensions}
                // User's Age Records
                userAgeRecords={userAgeRecords}
            />
            </div>
        </React.Fragment>
    )
};

export default AgeRecords;