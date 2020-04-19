import React from 'react'
import {HashRouter as Router, Route} from 'react-router-dom'
import Frame from './components/frame'
import Login from './components/login'

export default class extends React.Component {
  render() {
    return (
      <Router>
        <Route exact path="/login" component={Login} />
        <Route path="/view" component={Frame} />
      </Router>
    )
  }
}
