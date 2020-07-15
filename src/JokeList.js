import React, { Component } from "react"
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import './JokeList.css';
import Joke from './Joke'

class JokeList extends Component {
  static defaultProps = {
    numJokesToGet: 10
  };

  constructor (props) {
    super(props);
    this.state = { 
      jokes: JSON.parse(window.localStorage.getItem("jokes") || "[]"),
      loading: false,
    };
    this.existingJokes = new Set(this.state.jokes.map(j => j.text));
    this.handleVote = this.handleVote.bind(this);
    this.handleLoad = this.handleLoad.bind(this);
    this.handleReset = this.handleReset.bind(this);
  }

  componentDidMount () {
    if (this.state.jokes.length === 0) this.loadJokes();
    
  }

  async loadJokes () {
    try {
      let jokes = []
      while (jokes.length < this.props.numJokesToGet) {
        let res = await axios.get("http://icanhazdadjoke.com", {headers: { Accept: "application/json" }});
        let newJoke = res.data.joke;
        if (!this.existingJokes.has(newJoke)) {
          jokes.push({ id: uuidv4(), votes: 0, text: newJoke});
        }
      }
      this.setState(st => ({
        loading: false,
        jokes: [...st.jokes, ...jokes]
      }),
        () => window.localStorage.setItem(
          "jokes", 
          JSON.stringify(this.state.jokes)
        )
      );
    } catch (e) {
      alert(e);
      this.setState({loading: false})
    }
  }

  handleVote (id, change) {
    this.setState(
      st => ({
        jokes: st.jokes.map( j =>
          j.id === id ? { ...j, votes: j.votes + change } : j
        )
      }),
      () => window.localStorage.setItem(
        "jokes", 
        JSON.stringify(this.state.jokes)
      )
    );
  }

  handleLoad () {
    this.setState({ loading: true }, this.loadJokes);
  }

  handleReset () {
    this.setState({ loading: true, jokes: [] }, this.loadJokes);
  }
  
  render () {
    if (this.state.loading) {
      return (
        <div className="JokeList-loadingspinner">
          <i className="far fa-8x fa-laugh fa-spin"/>
          <h1 className="JokeList-title">Loading</h1>
        </div>
      )
    }
    
    let jokes = this.state.jokes.sort((a, b) => b.votes - a.votes);

    return (
      <div className="JokeList">
        <div className="JokeList-sidebar">
          <h1 className="JokeList-title">
            <span>Corny</span> Jokes
          </h1>
          <img src="https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg" alt="smiley emoji"/>
          <button onClick={this.handleLoad} className="JokeList-button">More Jokes</button>
          <button onClick={this.handleReset} className="JokeList-button">Reset Jokes</button>
        </div>
        <div className="JokeList-jokes">
          {jokes.map(j => (
            <Joke 
              key={j.id} 
              votes={j.votes} 
              text={j.text}
              upvote={() => this.handleVote(j.id, 1)}
              downvote={() => this.handleVote(j.id, -1)}
            />
          ))}
        </div>
      </div>
    )
  }
}

export default JokeList;