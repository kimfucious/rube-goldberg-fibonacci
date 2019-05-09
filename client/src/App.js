import React, { Component } from "react";
import logo from "./logo.svg";
import "./styles/bootstrap.min.css";
import "./App.css";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import OtherPage from "./OtherPage";
import Fib from "./Fib";

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <button
              className="navbar-toggler"
              type="button"
              data-toggle="collapse"
              data-target="#navbarColor02"
              aria-controls="navbarColor02"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon" />
            </button>

            <div className="collapse navbar-collapse" id="navbarColor02">
              <ul className="navbar-nav mr-auto">
                <li className="nav-item active">
                  <Link className="nav-link" to="/">
                    Home
                    <span className="sr-only">(current)</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/otherpage">
                    About
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
          <header className="jumbotron">
            <img src={logo} className="App-logo" alt="logo" />
            <h1 className="display-3 text-info">Fib Detector</h1>
            <h6 className="lead">The Rube Goldberg of Fibonacci Calculators</h6>
          </header>
          <div
            className="d-flex flex-column align-items-center container"
            style={{ maxWidth: "640px" }}
          >
            <Route exact path="/" component={Fib} />
            <Route path="/otherpage" component={OtherPage} />
          </div>
        </div>
      </Router>
    );
  }
}

export default App;
