import React from 'react'
import {HashRouter as Router, Route, Redirect, Switch} from 'react-router-dom'
import Frame from './components/frame'
import Login from './components/login'

export default class extends React.Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route exact path="/login" component={Login} />
          <Route path="/view" component={Frame} />
          <Redirect from="/" to="/view" />
        </Switch>
      </Router>
    )
  }
}
