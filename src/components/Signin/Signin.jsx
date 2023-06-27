import React, { Component } from "react";

class Signin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      signInEmail: '',
      signInPassword: '',
    }
  }

  // Listens to onChange events of email && password <input>
  onEmailChange = (event) => {
    this.setState({ signInEmail: event.target.value }, () => {
      // console.log('this.state.signInEmail: \n', this.state.signInEmail);
    })
  }

  onPasswordChange = (event) => {
    this.setState({ signInPassword: event.target.value }, () => {
      // console.log('this.state.signInPassword: \n', this.state.signInPassword);
    })
  }

  // App 'Sign In' button onClick event handler
  onSubmitSignIn = (event) => {
    event.preventDefault(); // Stop page from refreshing on Signin form submission

    // Send Sign In info as HTTP POST request to server localhost:3000
    // by fetching our server - localhost:3000/signin
    // fetch(url, {method: '', headers: '', body: JSON.stringify({ email: '', password: ''}) })
    fetch('http://localhost:3000/signin', {
      method: 'post', // Post (Create) to avoid Query Strings
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ // sending stringified this.state variables as JSON objects
        email: this.state.signInEmail,
        password: this.state.signInPassword
      })
    })
    .then(response => response.json()) // JSON server response to parse data
    .then(user => { // server.js - app.post('/signin') --> res.json(database.users[i])
      console.log('onSubmitSignIn - response: \n', user);
      console.log('onSubmitSignIn - typeof response: \n', typeof user);
      if (user.id) { // if user.id exists
        this.props.loadUser(user);
        this.props.onRouteChange('home');
      }
    })
  }

  render() {
    const { onRouteChange } = this.props;
    return (
      <div>
        <article className="br3 ba b--black-10 mv4 w-100 w-50-m w-25-l mw6 shadow-5 center">
        <main className="pa4 black-80">
          <form className="measure">
            <fieldset id="sign_up" className="ba b--transparent ph0 mh0">
              <legend className="f1 fw6 ph0 mh0">Sign In</legend>
              <div className="mt3">
                <label className="db fw6 lh-copy f6" htmlFor="email-address">
                  Email
                </label>
                <input
                  className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100"
                  type="email"
                  name="email-address"
                  id="email-address"
                  onChange={this.onEmailChange}
                />
              </div>
              <div className="mv3">
                <label className="db fw6 lh-copy f6" htmlFor="password">
                  Password
                </label>
                <input
                  className="b pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100"
                  type="password"
                  name="password"
                  id="password"
                  onChange={this.onPasswordChange}
                />
              </div>
              {/* <label className="pa0 ma0 lh-copy f6 pointer">
                <input type="checkbox" /> Remember me
              </label> */}
            </fieldset>
            <div className="">
              <input
                // onClick={() => onRouteChange('home')}
                onClick={this.onSubmitSignIn}
                className="b ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6 dib"
                type="submit"
                value="Sign in"
              />
            </div>
            <div className="lh-copy mt3">
              <p
               onClick={() => onRouteChange('register')} 
               className="f6 link dim black db pointer">
                Register
              </p>
            </div>
          </form>
        </main>
        </article>
      </div>
    );
  }
};

export default Signin;
