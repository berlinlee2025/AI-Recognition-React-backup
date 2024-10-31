import React, { useState, useEffect, useCallback, useContext } from 'react';
import './App.scss';

// Top Navigation panel
import Navigation from './components/Navigation/Navigation';

// Routes
import Home from './routes/Home/Home';
import Signin from './routes/Signin/Signin';
import Register from './routes/Register/container/Register';

// User Records
import CheckRecordsPanel from './components/CheckRecords/CheckRecordsPanel';
import ColorRecords from './routes/Records/ColorRecords/ColorRecords';
import CelebrityRecords from './routes/Records/CelebrityRecords/CelebrityRecords';
import AgeRecords from './routes/Records/AgeRecords/AgeRecords';

// Utility helper functions
// import loadUserFromLocalStorage from './util/loadUserFromLocalStorage';
import findCelebrity from './util/ai-detection/findCelebrity';
import findColor from './util/ai-detection/findColor';
import findAge from './util/ai-detection/findAge';
import calculateFaceLocation from './util/ai-detection/calculateFaceLocation';
import { returnDateTime } from './util/returnDateTime';
import axios from 'axios';

// Context API
import { UserContext } from './shared/context/user-context';

const App = () => {

  const [state, setState] = useState({
    input: '', // this.state.input => Users' input imageUrl => Can be used for onClick events
      imageUrl: '', // this.state.imageUrl should NOT be used for onClick => React circular references
      box: {},
      celebrity: {},
      celebrityName: '',
      colors: [],
      dimensions: { width: window.innerWidth }, // Initialize dimensions state
      age: [],
      face_hidden: true,
      color_hidden: true,
      age_hidden: true,
      responseStatusCode: Number(''),
      route: 'signin',

      user: {},
      isSignedIn: false,

      userCelebrityRecords: [],
      userColorRecords: [],
      userAgeRecords: [],
  });

  /* Listen to changes in state.isSignedIn for any updates */
  useEffect(() => {
    const handleResize = () => {
      setState(prevState => ({ ...prevState, dimensions: { width: window.innerWidth } }));
    };

    const lastRoute = localStorage.getItem('lastRoute');
    if (lastRoute && state.isSignedIn) {
      setState(prevState => ({ ...prevState, route: lastRoute }));
    }

    window.addEventListener('resize', handleResize);

    const interval = setInterval(() => {
      setState(prevState => ({ ...prevState, dimensions: { width: window.innerWidth } }));
    }, 120000);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(interval);
    };
  }, [state.isSignedIn]);

  /* Mount state.user on React app start 
  Mount state.dimensions on React app start */
  useEffect(() => {
    fetchUserData();

    setState(prevState => ({
      ...prevState,
      dimensions: { width: window.innerWidth }
    }))
  }, []);

  /* Listening to changes to any of below => console log them */
  useEffect(() => {

    console.log('\nstate.input: \n', state.input, `\n`);
    console.log('\nstate.face_hidden', state.face_hidden, `\n`);
    console.log('\nstate.color_hidden', state.color_hidden, `\n`);
    console.log('\nstate.age_hidden', state.age_hidden, `\n`);
    console.log('\nstate.responseStatusCode:\n', state.responseStatusCode, `\n`);
    console.log(`\nstate.route:\n`, state.route, `\n`);
    console.log(`\nstate.user:\n`, state.user, `\n`);
    
  }, [state.input, state.face_hidden, state.color_hidden, state.age_hidden, state.responseStatusCode, state.route, state.user]);
  
  /** user-context **/

  // ** src/shared/context/user-context.js
  // useCallback means when this saveUser callback is invoked, it never gets recreated
  const saveUser = useCallback((user) => {
    setState(prevState => ({
      ...prevState,
      user: user
    }))
  }, []);

  // ** src/shared/context/user-context.js
  const resetUser = useCallback(() => {
    setState(prevState => ({ 
      ...prevState,
      user: {}, 
      isSignedIn: false, 
      route: 'signin' 
    })
    );
  }, []);

  // ** src/shared/context/user-context.js
  const onRouteChange = useCallback((routeInput) => {
    const callbackName = `onRouteChange`;

    switch (routeInput) {
        case 'signout':
          setState(prevState => ({ 
            ...prevState,
            route: 'signin',
            isSignedIn: routeInput !== 'signin'
          })
          );
          console.log(`\n${callbackName}(signout)\n`);
          break;
        
        // else if onClick={() => onRouteChange('home')}
        case 'home':
        case 'ageRecords':
        case 'colorRecords':
        case 'celebrityRecords':
          setState(prevState => ({
            ...prevState,
            route: routeInput,
            isSignedIn: true,
          })
          );
          return;
        
        // No matter what, still wanna change the route
        default:
          setState(prevState => ({ 
            ...prevState, 
            route: routeInput,
          })
        );
          return;
    }
  }, []);

  // ** src/shared/context/user-context.js
  /* Session cookie */
  const fetchUserData = useCallback(() => {
    const devUserDataUrl = `http://localhost:3001/api/get-user-data`;
    const prodUserDataUrl = `https://www.ai-recognition-backend.com/api/get-user-data`;

    const fetchUrl = process.env.NODE_ENV === 'production' ? prodUserDataUrl : devUserDataUrl;

    axios.get(fetchUrl, { withCredentials: true })
    .then((response) => {
      if (response.data) {
        setState(prevState => ({
          ...prevState,
          user: response.data,
          isSignedIn: true,
        })); 
      }
    })
    .catch((err) => {
      console.error(`\nFailed to fetch user data: `, err, `\n`);
      setState(prevState => ({ 
        ...prevState, isSignedIn: false, route: 'signin' 
      }));
    });
  }, []);

  /** user-context **/
  
  // For Celebrity detection model
  const displayCelebrity = (celebrity) => {
    setState(prevState => ({
      ...prevState,
      celebrity: celebrity
    })
    );
  };

  // For Color detection model
  const displayColor = (colorInput) => {
    setState(prevState => ({ 
      ...prevState,
      colors: colorInput 
    })
    );
  };

  // For Age detection model
  const displayAge = (ageInput) => {
    setState(prevState => ({ 
      ...prevState,
      age: ageInput 
    })
    );
  };

  const displayFaceBox = (box) => {
    setState(prevState => ({ 
      ...prevState,
      box: box 
    })
    );
  };

  // For <ImageLinkForm />
  const onInputChange = (event) => {
    setState(prevState => ({
      ...prevState, 
      input: event.target.value 
    })
    );
  };

  // Everytime any of Detection Models is clicked
  // reset all state variables to allow proper rendering of DOM elements
  const resetState = () => {
    setState(prevState => ({
      ...prevState,
      box: {},
      celebrity: {},
      celebrityName: '',
      colors: [],
      age: [],
      face_hidden: true,
      color_hidden: true,
      age_hidden: true,
      responseStatusCode: Number(''),
    })
    );
  };

  // reset all User's color & celebrity & age detection records in Frontend
  const resetUserRecords = () => {
    setState(prevState => ({
      ...prevState,
      userColorRecords: [],
      userCelebrityRecords: [],
      userAgeRecords: []
    })
    );
  }

  // Everytime any of the Detection Models is activated
  // update this.state.user.entries by 1 through
  // sending data to server-side
  
  /* Updating Entries - Fetching local web server vs live web server on Render */
  const updateEntries = async () => {
    const devUpdateEntriesUrl = 'http://localhost:3001/image';
    const prodUpdateEntriesUrl = 'https://www.ai-recognition-backend.com/image';

    const fetchUrl = process.env.NODE_ENV === 'production' ? prodUpdateEntriesUrl : devUpdateEntriesUrl;
    
    await fetch(fetchUrl, {
        method: 'PUT', // PUT (Update) 
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ // sending stringified this.state variables as JSON objects
        id: state.user.id
        })
      })
      .then(response => {
        return response.json()
    })
    .then(fetchedEntries => {
      console.log(`fetched ENTRIES from server: \n ${fetchedEntries}`);
      console.log(`typeof fetched ENTRIES from server: \n ${typeof fetchedEntries}`);

      setState(prevState => ({
          ...prevState,
          entries: fetchedEntries
      }))
    })
    .catch(err => {
      console.log(`\nError Fetching ${fetchUrl}:\n${err}\n`)
    });
  }

  // To be passed to <CheckRecordsPanel /> in src/components/CheckRecords/CheckRecrodsPanel.jsx
  const onHomeButton = () => {
    // Reset all state variables to allow proper rendering from Detection Models
    resetState();

    // Reset User's all color & celebrity & age records in Frontend
    resetUserRecords();

    // Change Route to 'home' => Checkout App.js onRouteChange()
    onRouteChange('home');

    setState(prevState => ({ 
      ...prevState,
      route: 'home' 
    })
    );
  }

  // Retrieve User's Color Records from Node.js => PostgreSQL
  const onCelebrityRecordsButton = async () => {
    // Reset all state variables to allow proper rendering of side-effects
    resetState();

    setState(prevState => ({ 
      ...prevState,
      route: 'celebrityRecords' 
      })
    );

    // Change Route to 'colorRecords' => Checkout App.js onRouteChange()
    onRouteChange('celebrityRecords');

    const devFetchGetUserCelebrityUrl = 'http://localhost:3001/records/get-user-celebrity';
    const prodFetchGetUserCelebrityUrl = 'https://www.ai-recognition-backend.com//records/get-user-celebrity';

    const fetchUrl = process.env.NODE_ENV === 'production' ? prodFetchGetUserCelebrityUrl : devFetchGetUserCelebrityUrl;

    const bodyData = JSON.stringify({
      userId: state.user.id
    });

    console.log(`\nonCelebrityRecordsButton is fetching ${fetchUrl} with bodyData: `, bodyData, `\n`);

    await fetch(fetchUrl, {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        userId: state.user.id
      })
    })
    .then(response => response.json())
    .then(response => {
      console.log(`\nFetched User's Celebrity Records response:\n`, response, `\n`);
      console.log(`\nFetched User's Celebrity Records\nresponse.celebrityData`, response.celebrityData, `\n`);
      // If there's a response upon fetching Clarifai API
      // fetch our server-side to update entries count too
      if (response) { 
        // updateEntries();
        setState(prevState => ({
          ...prevState,
          userCelebrityRecords: response.celebrityData
        })
      )
      };
    })
    .catch((err) => {
      console.log(`\nError fetching ${fetchUrl}:\n${err}\n`);
    });

    console.log(`\nsrc/App.js this.state.userCelebrityRecords:\n`, state.userCelebrityRecords, `\n`);
  }

  // ClarifaiAPI Celebrity Face Detection model
  const onCelebrityButton = async () => {
    // Reset all state variables to allow proper rendering from Detection Models
    // Before next fetch
    resetState();

    // Whenever clicking Detect button => setState
    setState(prevState => ({
        ...prevState,
        // setState imageUrl: state.input from InputChange as event onChange
        // Thus state.imageUrl = a React Event => NOT be used as props involving circular references
        imageUrl: state.input,
        face_hidden: false
      })
    );

    /* From Clarifai API documentation, this API can be consumed as below: */

    /* Celebrity Recognition - Fetching local web server for celebrityimage */
    const devFetchCelebrityImageUrl = 'http://localhost:3001/celebrity-image';
    const prodFetchCelebrityImageUrl = 'https://www.ai-recognition-backend.com//celebrity-image';

    const fetchUrl = process.env.NODE_ENV === 'production' ? prodFetchCelebrityImageUrl : devFetchCelebrityImageUrl;

    await fetch(fetchUrl, {
        method: 'POST', 
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ // sending stringified state variables as JSON objects
          input: state.input
        })
      })
      .then(response => response.json())
      .then(response => {
        console.log('HTTP Response: \n', response);
        console.log('HTTP request status code:\n', response.status.code);
        console.log(
          'bounding box',
          response.outputs[0].data.regions[0].region_info.bounding_box
        );
        console.log(
          'Celebrity obj:\n',
          response.outputs[0].data.regions[0].data.concepts[0]
        );

        if (response) { 
          updateEntries();
        };

        displayFaceBox(calculateFaceLocation(response));
        // displayCelebrity(findCelebrity(response));
        displayCelebrity(findCelebrity(response));
        setState(prevState => ({ 
          ...prevState,
          responseStatusCode: response.status.code 
        })
        )
      })
      .catch(err => {
        console.log(`\nError Fetching ${fetchUrl}:\n${err}\n`)
      });
  };

  // Retrieve User's Color Records from Node.js => PostgreSQL
  const onColorRecordsButton = async () => {
    // Reset all state variables to allow proper rendering of side-effects
    resetState();

    // Change Route to 'colorRecords' => Checkout App.js onRouteChange()
    onRouteChange('colorRecords');

    const devFetchGetUserColorUrl = 'http://localhost:3001/records/get-user-color';
    const prodFetchGetUserColorUrl = 'https://www.ai-recognition-backend.com//records/get-user-color';

    const fetchUrl = process.env.NODE_ENV === 'production' ? prodFetchGetUserColorUrl : devFetchGetUserColorUrl;

    const bodyData = JSON.stringify({
      userId: state.user.id
    });

    console.log(`\nFetching ${fetchUrl} with bodyData: `, bodyData, `\n`);

    await fetch(fetchUrl, {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        userId: state.user.id
      })
    })
    .then(response => response.json())
    .then(response => {
      console.log(`\nFetched User's Colors Records obj:\n`, response, `\n`);
      console.log(`\nFetched User's Colors Records obj:\n`, response.colorData, `\n`);
      // If there's a response upon fetching Clarifai API
      // fetch our server-side to update entries count too
      if (response) { 
        // updateEntries();
        setState(prevState => ({
          ...prevState,
          userColorRecords: response.colorData
        })
      )
      };
    })
    .catch((err) => {
      console.log(`\nError Fetching ${fetchUrl}:\n${err}\n`);
    });

    console.log(`\nsrc/App.js state.userColorRecords:\n`, state.userColorRecords, `\n`);
  }

  // ClarifaiAPI Color Detection model
  const onColorButton = async () => {
    // Reset all state variables to allow proper rendering from Detection Models
    // Before next fetch
    resetState(); 

    // Whenever clicking Detect button
    setState(prevState => ({
        ...prevState,
        // setState imageUrl: state.input from InputChange
        imageUrl: state.input,
        // setState color_hidden: false to allow rendering of <ColorRecognition />
        // then passing color_props to <ColorRecognition />
        color_hidden: false
      })
    );

    /* Color Recognition - Fetching local Web Server vs live Web Server on Render */
    const devFetchColorImageUrl = 'http://localhost:3001/color-image';
    const prodFetchColorImageUrl = 'https://www.ai-recognition-backend.com//color-image';

    const fetchUrl = process.env.NODE_ENV === 'production' ? prodFetchColorImageUrl : devFetchColorImageUrl;

    await fetch(fetchUrl, {
      method: 'post', 
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ // sending stringified state variables as JSON objects
        input: state.input
      })
    })
    .then(response => response.json())
    .then(response => {
      console.log('Fetched Colors obj:\n', response.outputs[0].data);
      // If there's a response upon fetching Clarifai API
      // fetch our server-side to update entries count too
      if (response) { 
        updateEntries();
      };

      displayColor(findColor(response));
    })
    .catch(err => {
      console.log(`\nError Fetching ${fetchUrl}:\n${err}\n`)
    });
  };
  
  // Retrieve User's Color Records from Node.js => PostgreSQL
  const onAgeRecordsButton = async () => {
    // Reset all state variables to allow proper rendering of side-effects
    resetState();

    // Change Route to 'colorRecords' => Checkout App.js onRouteChange()
    onRouteChange('ageRecords');

    const devFetchGetUserColorUrl = 'http://localhost:3001/records/get-user-age';
    const prodFetchGetUserColorUrl = 'https://www.ai-recognition-backend.com//records/get-user-age';

    const fetchUrl = process.env.NODE_ENV === 'production' ? prodFetchGetUserColorUrl : devFetchGetUserColorUrl;

    const bodyData = JSON.stringify({
      userId: state.user.id
    });

    console.log(`\nFetching ${fetchUrl} with bodyData: `, bodyData, `\n`);

    await fetch(fetchUrl, {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        userId: state.user.id
      })
    })
    .then(response => response.json())
    .then(response => {
      console.log(`\nFetched User's Age Records response:\n`, response, `\n`);
      console.log(`\nFetched User's Age Records response.ageData:\n`, response.ageData, `\n`);
      // If there's a response upon fetching Clarifai API
      // fetch our server-side to update entries count too
      if (response) { 
        // updateEntries();
        setState(prevState => ({
          ...prevState,
          userAgeRecords: response.ageData
        })
      )
      };
    })
    .catch((err) => {
      console.log(`\nError Fetching ${fetchUrl}:\n${err}\n`);
    });

    console.log(`\nsrc/App.js state.userAgeRecords:\n`, state.userAgeRecords, `\n`);
  }

  // ClarifaiAPI Age Detection model
  const onAgeButton = async () => {
    // Reset all state variables to allow proper rendering from Detection Models
    // Before next fetch
    resetState();

    // Whenever clicking 'Detect Age' button
    setState(prevState => ({
        ...prevState,
        // setState imageUrl: state.input from InputChange
        imageUrl: state.input,
        // setState({age_hidden: false}) to allow rendering of <AgeRecognition />
        age_hidden: false
      })
    );

    /* Age Recognition - Fetching local dev server vs live Web Server on Render */
    const devFetchAgeUrl = 'http://localhost:3001/age-image';
    const prodFetchAgeUrl = 'https://www.ai-recognition-backend.com//age-image';

    const fetchUrl = process.env.NODE_ENV === 'production' ? prodFetchAgeUrl : devFetchAgeUrl;

    await fetch(fetchUrl, {
        method: 'post', 
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ // sending stringified state variables as JSON objects
          input: state.input
        })
    })
    .then(response => response.json())
    .then(response => {
      console.log('\nHTTP Response\nAge Detection', response);
      console.log('\nHTTP request status code:\n', response.status.code);
      console.log(
        'Fetched Age grp obj:\n',
        response.outputs[0].data.concepts
    );

    // color-detection
    // displayColor adding color hex to state.color
    // findColor(response) returns color hex
    if (response) { 
      updateEntries();
      };
      displayAge(findAge(response));
    })
    .catch((err) => {
      console.log(`\nError Fetching ${fetchUrl}:\n${err}\n`)
    });
  };

  // src/components/Navigation/Navigation.jsx
  const onSignout = useCallback(async () => {
    resetState();

    const devSignoutUrl = `http://localhost:3001/signout`;
    const prodSignoutUrl = `https://www.ai-recognition-backend.com//signout`;
    const fetchUrl = process.env.NODE_ENV === 'production' ? prodSignoutUrl : devSignoutUrl;

    await fetch(fetchUrl, {
      method: 'post',
      credentials: 'include', // To include credentials for cookies
    })
    .then((response) => {
      setState(prevState => ({
        ...prevState,
        celebrity: {},
        colors: [],
        age: [],
        user: {},
        isSignedIn: false,
        route: 'signin'
      })
      );
      onRouteChange('signin')
    })
    .catch((err) => {
      console.error(`Error signing out user: `, err, `\n`);
    })
  }, [onRouteChange]);

  // To avoid malicious users from breaking in from <Register />
  // If there's no user.id => route to 'signin' page
  const validateUsers = () => {
    if (!state.user.id) {
      onRouteChange('signin');
    }
  };

  /* Rendering all components */
  // destructuring props from state
  const {
    age,
    face_hidden,
    color_hidden,
    age_hidden,
    box,
    colors,
    celebrity,
    dimensions,
    imageUrl,
    input,
    responseStatusCode,
    user,
    userAgeRecords,
    userCelebrityRecords,
    userColorRecords,
    route,
    isSignedIn
  } = state;

    const colors_array = colors && colors.length > 0 ? colors.map(color => color) : [];
    const age_props = age && age.length > 0 ? age.map((each, i) => each.age.name)[0] : [];

    const dateTime = returnDateTime();
    console.log('\ndateTime:\n', dateTime, `\n`);
    
    const renderRoute = (component) => {
      return user ? component : <Signin onRouteChange={onRouteChange} saveUser={saveUser} />;
    }

    // Enhance React Scalability for allowing to add more React routes without React Router DOM
    const routeComponents = {
      'home': renderRoute(
        <UserContext.Provider 
          value={{ 
            user: user,
            isSignedIn: isSignedIn,
            saveUser: saveUser,
            resetUser: resetUser,
            onRouteChange: onRouteChange,
            fetchUserData: fetchUserData
          }}
        >
          <Home
            name={user?.name}
            entries={user?.entries}
            input={input}
            imageUrl={imageUrl}
            celebrityName={celebrity?.name}
            face_hidden={face_hidden}
            onInputChange={onInputChange}

            // AI Recognition buttons
            onCelebrityButton={onCelebrityButton}
            onColorButton={onColorButton}
            onAgeButton={onAgeButton}

            color_props={colors_array}
            color_hidden={color_hidden}
            age={age_props}
            age_hidden={age_hidden}
            box={box}

            // 4 Buttons in <CheckRecordsPanel />
            // 1. 'Home' page
            onHomeButton={onHomeButton}
            // 2. 'Celebrity records' page
            onCelebrityRecordsButton={onCelebrityRecordsButton}
            // Passing userColorRecords to 'Color records' page
            userCelebrityRecords={userCelebrityRecords}
            // 3. 'Color records' page
            onColorRecordsButton={onColorRecordsButton}
            // Passing userColorRecords to 'Color records' page
            userColorRecords={userColorRecords}
            // 4. 'Age records' page
            onAgeRecordsButton={onAgeRecordsButton}
            // Passing userColorRecords to 'Color records' page
            userAgeRecords={userAgeRecords}
            resetUser={resetUser}
            resetState={resetState}
          />
        </UserContext.Provider>
      ),
      'signin': renderRoute(
        <UserContext.Provider 
          value={{ 
            user: user,
            isSignedIn: isSignedIn,
            saveUser: saveUser,
            resetUser: resetUser,
            onRouteChange: onRouteChange,
            fetchUserData: fetchUserData
          }}
        >
          <Signin />
        </UserContext.Provider>
      ),
      'register': renderRoute(
        <UserContext.Provider 
        value={{ 
          user: user,
          isSignedIn: isSignedIn,
          saveUser: saveUser,
          resetUser: resetUser,
          onRouteChange: onRouteChange,
          fetchUserData: fetchUserData
        }}
        >
          <Register 
            route={route}
            user={user}
            saveUser={saveUser}
            onRouteChange={onRouteChange}
            fetchUserData={fetchUserData} 
          />
        </UserContext.Provider>
      ),
      'ageRecords': renderRoute(
        <React.Fragment>
          <UserContext.Provider 
          value={{ 
            user: user,
            isSignedIn: isSignedIn,
            saveUser: saveUser,
            resetUser: resetUser,
            onRouteChange: onRouteChange,
            fetchUserData: fetchUserData
          }}
          >
            <CheckRecordsPanel 
              dimensions={dimensions}
              
              // 4 Buttons in CheckRecordsPanel /> Home, Age records, Celebrity records, Color records
              onHomeButton={onHomeButton}
              onCelebrityRecordsButton={onCelebrityRecordsButton}
              onColorRecordsButton={onColorRecordsButton}
              onAgeRecordsButton={onAgeRecordsButton}
            />
            <AgeRecords
              dimensions={dimensions}
              userAgeRecords={userAgeRecords}
            />
          </UserContext.Provider>
        </React.Fragment>
      ),
      'colorRecords': renderRoute(
        <React.Fragment>
          <UserContext.Provider 
          value={{ 
            user: user,
            isSignedIn: isSignedIn,
            saveUser: saveUser,
            resetUser: resetUser,
            onRouteChange: onRouteChange,
            fetchUserData: fetchUserData
          }}
          >
            <CheckRecordsPanel 
              dimensions={dimensions}
              
              // 4 Buttons in CheckRecordsPanel /> Home, Age records, Celebrity records, Color records
              onHomeButton={onHomeButton}
              onCelebrityRecordsButton={onCelebrityRecordsButton}
              onColorRecordsButton={onColorRecordsButton}
              onAgeRecordsButton={onAgeRecordsButton}
            />
            <ColorRecords
              dimensions={dimensions}
              userColorRecords={userColorRecords}
            />
          </UserContext.Provider>
        </React.Fragment>
      ),
      'celebrityRecords': renderRoute(
        <React.Fragment>
          <UserContext.Provider 
          value={{ 
            user: user,
            isSignedIn: isSignedIn,
            saveUser: saveUser,
            resetUser: resetUser,
            onRouteChange: onRouteChange,
            fetchUserData: fetchUserData
          }}
          >
            <CheckRecordsPanel 
            dimensions={dimensions}
            
            // 4 Buttons in CheckRecordsPanel /> Home, Age records, Celebrity records, Color records
            onHomeButton={onHomeButton}
            onCelebrityRecordsButton={onCelebrityRecordsButton}
            onColorRecordsButton={onColorRecordsButton}
            onAgeRecordsButton={onAgeRecordsButton}
            />
            <CelebrityRecords
              dimensions={dimensions}
              
              // state.userCelebrityRecords
              userCelebrityRecords={userCelebrityRecords}
              // 4 Buttons in CheckRecordsPanel /> Home, Age records, Celebrity records, Color records
              onHomeButton={onHomeButton}
              onCelebrityRecordsButton={onCelebrityRecordsButton}
              onColorRecordsButton={onColorRecordsButton}
              onAgeRecordsButton={onAgeRecordsButton}
            />
          </UserContext.Provider>
        </React.Fragment>
      )
    }

    return (
      <div className="App star">
        {/* Conditional rendering */}
        <UserContext.Provider 
          value={{ 
            user: user,
            isSignedIn: isSignedIn,
            saveUser: saveUser,
            resetUser: resetUser,
            onRouteChange: onRouteChange,
            fetchUserData: fetchUserData,
            resetState: resetState,
            onSignout: onSignout
          }}
        >
          <Navigation />
        </UserContext.Provider>

        {routeComponents[route] ?? <div>Page not found</div>}
      </div>
    );
};

export default App;
