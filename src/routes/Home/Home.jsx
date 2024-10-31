import React, { useState, useEffect, useContext } from 'react';
// import Rank from '../../components/Rank/Rank';
import CheckRecordsPanel from '../../components/CheckRecords/CheckRecordsPanel';
import ImageLinkForm from '../../components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from '../../components/AIRecognition/FaceRecognition/FaceRecognition';
import ColorRecognition from '../../components/AIRecognition/ColorRecognition/ColorRecognition';
import AgeRecognition from '../../components/AIRecognition/AgeRecognition/AgeRecognition';
import Loading from '../../components/Loading/Loading';
import Signin from '../Signin/Signin';

import { UserContext } from "../../shared/context/user-context";

// Parent component
// src/App.js
const Home = ( {
    name,
    entries,
    input,
    imageUrl,
    celebrityName,
    face_hidden,
    onInputChange,
    onCelebrityButton,
    onColorButton,
    onSaveColorButton,
    onAgeButton,
    color_props,
    color_hidden,
    age,
    age_hidden,
    box,

    // 1. 'Home' page
    onHomeButton,
    // 2. 'Celebrity records' page
    onCelebrityRecordsButton,
    userCelebrityRecords,
    // 3. 'Color records' page
    onColorRecordsButton,
    userColorRecords,
    // 4. 'Age records' page
    onAgeRecordsButton,    
    userAgeRecords,
    resetState 
} ) => {
    const userContext = useContext(UserContext);

    // Making userData available before <FaceRecognition /> <ColorRecognition /> <AgeRecognition /> needing user.id for fetching data to Node.js server
    
    /* onMount to DOM tree of <Home /> once only */
    useEffect(() => {
        console.log(`\ncomponent Home.jsx is mounted!\n`);
        userContext.onRouteChange('home');
    }, []); 


    return (
        <React.Fragment>
            <CheckRecordsPanel 
                user={userContext.user} 
                isSignedIn={userContext.isSignedIn}
                resetState={resetState} 
                onRouteChange={userContext.onRouteChange}

                // 1. 'Home' page
                onHomeButton={onHomeButton}
                // 2. 'Celebrity records' page
                userCelebrityRecords={userCelebrityRecords}
                onCelebrityRecordsButton={onCelebrityRecordsButton}
                // 3. 'Color records' page
                userColorRecords={userColorRecords}
                onColorRecordsButton={onColorRecordsButton}
                // 4. 'Age records' page
                userAgeRecords={userAgeRecords}
                onAgeRecordsButton={onAgeRecordsButton}
            />
            <ImageLinkForm
                onInputChange={onInputChange}
                onCelebrityButton={onCelebrityButton}
                onColorButton={onColorButton}
                onAgeButton={onAgeButton}
                face_hidden={face_hidden}
                color_hidden={color_hidden}
                age_hidden={age_hidden}
            />
            <FaceRecognition
                user={userContext.user}
                onRouteChange={userContext.onRouteChange}

                input={input}
                imageUrl={imageUrl}
                box={box}
                celebrityName={celebrityName}
                face_hidden={face_hidden}
            />
            <ColorRecognition
                user={userContext.user}
                onRouteChange={userContext.onRouteChange}

                input={input}
                imageUrl={imageUrl}
                color_props={color_props}
                color_hidden={color_hidden}
                name={name}
                // onSaveColorButton={onSaveColorButton}
            />
            <AgeRecognition
                user={userContext.user}
                onRouteChange={userContext.onRouteChange}

                age={age}
                input={input}
                imageUrl={imageUrl}
                age_hidden={age_hidden}
            />
        </React.Fragment>
    )
};

export default Home;