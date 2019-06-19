import React from "react"
import ReactDOM from "react-dom"
import Chess from "chess.js"
import Chessground from "react-chessground"
import "react-chessground/dist/styles/chessground.css"
import { Col, Row, Modal, Button, Radio, Avatar } from "antd"

const sleep = milliseconds => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

class Demo extends React.Component {
  chess = new Chess()

  state = {
    selectVisible: false,
    visibleUserwin: false,
    visibleComwin: false,
    visibleDraw: false,
    userTimeout: false,
    comTimeout: false,
    isPaused: false,
    isPausedCom: true,
    time: 600,
    timeCom: 600,
    mytime: "",
    opptime: "",
    fen: "",
    lastMove: null,
    scoreUser: 10,
    scoreCom: 10
  }

  pendingMove = null

  tUser = setInterval(() => {
    const { isPaused, time } = this.state
    let min = Math.floor(time / 60)
    let sec = time - min * 60
    if (min < 10) {
      min = `0${min}`
    }
    if (sec < 10) {
      sec = `0${sec}`
    }
    const message = `${min}:${sec}`

    if (!isPaused && time > 0) {
      this.setState({ time: time - 1 })
    }

    this.setState({ mytime: message })
    return message
  }, 1000)

  tCom = setInterval(() => {
    const { isPausedCom, timeCom } = this.state
    let min = Math.floor(timeCom / 60)
    let sec = timeCom - min * 60
    if (min < 10) {
      min = `0${min}`
    }
    if (sec < 10) {
      sec = `0${sec}`
    }
    const message = `${min}:${sec}`

    if (!isPausedCom && timeCom > 0) {
      this.setState({ timeCom: timeCom - 1 })
    }

    this.setState({ opptime: message })
    return timeCom
  }, 1000)

  onMove = (from, to) => {
    const { chess } = this
    const moves = chess.moves({ verbose: true })
    console.info(chess.moves({ verbose: true }))
    for (let i = 0, len = moves.length; i < len; i++) { /* eslint-disable-line */
      if (moves[i].flags.indexOf("p") !== -1) {
        this.pendingMove = [from, to]
        this.setState({
          selectVisible: true
        })
        return
      }
      const { scoreUser, scoreCom, time, timeCom } = this.state
      if (time < 1) {
        this.setState({ userTimeout: true })
      }
      if (timeCom < 1) {
        this.setState({ comTimeout: true })
      }
      if (chess.move({ from, to, promotion: "x" })) {
        this.setState({ fen: chess.fen(), lastMove: [from, to], isPaused: true, isPausedCom: false })
        setTimeout(this.randomMove, 1500)
        if (this.chess.in_checkmate() === true) {
          this.setState({
            visibleUserwin: true,
            scoreUser: scoreUser + 10,
            scoreCom: scoreCom - 5
          })
        }
        if (this.chess.in_stalemate() === true) {
          this.setState({
            visibleDraw: true
          })
        }
      }
    }
  }

  onChange(e) {
    const { chess } = this
    const from = this.pendingMove[0]
    const to = this.pendingMove[1]
    chess.move({ from, to, promotion: e.target.value })
    this.setState({
      fen: chess.fen(),
      lastMove: [from, to],
      selectVisible: false
    })
    setTimeout(this.randomMove, 500)
  }

  randomMove = () => {
    const { chess } = this
    const { scoreUser, scoreCom, time, timeCom } = this.state
    const moves = chess.moves({ verbose: true })
    const move = moves[Math.floor(Math.random() * moves.length)]
    if (time < 1) {
      this.setState({ userTimeout: true })
    }
    if (timeCom < 1) {
      this.setState({ comTimeout: true })
    }
    if (moves.length > 0) {
      chess.move(move.san)
      this.setState({ fen: chess.fen(), lastMove: [move.from, move.to], isPaused: false, isPausedCom: true })
      if (this.chess.game_over() === true) {
        this.setState({
          visibleComwin: true,
          scoreCom: scoreCom + 10,
          scoreUser: scoreUser - 5
        })
      }
      if (this.chess.in_stalemate() === true) {
        this.setState({
          visibleDraw: true
        })
      }
    }
    sleep(2000).then(() => {
      this.setState({ visibleUserwin: false, visibleComwin: false, visibleDraw: false, userTimeout: false, comTimeout: false })
    })
  }

  reset = () => {
    this.chess.reset()
    this.setState({ fen: this.chess.fen() })
  }

  undo = () => {
    if (!this.chess.game_over()) {
      this.chess.undo()
      this.setState({ fen: this.chess.fen() })
    }
  }

  turnColor() {
    return this.chess.turn() === "w" ? "white" : "black"
  }

  calcMovable() {
    const dests = {}
    this.chess.SQUARES.forEach(s => {
      const ms = this.chess.moves({ square: s, verbose: true })
      if (ms.length) dests[s] = ms.map(m => m.to)
    })
    return {
      free: false,
      dests,
      color: this.myColor()
    }
  }

  myColor() {
    return "white"
  }

  render() {
    const {
      selectVisible,
      userTimeout,
      comTimeout,
      fen,
      visibleUserwin,
      visibleComwin,
      visibleDraw,
      lastMove,
      scoreUser,
      scoreCom,
      mytime,
      opptime
    } = this.state
    return (
      <div style={{ background: "#2b313c", height: "100vh" }}>
        <Row style={{ marginLeft: "31%", paddingTop: "1%", paddingBottom: "1%", marginRight: "31%" }}>
          <Avatar shape="square" style={{ background: "#3c93b0" }} size="large" icon="user" />
          <span style={{ marginLeft: 10, color: "white", verticalAlign: "top" }}>test</span>
          <div style={{ color: "white", float: "right" }}>{opptime}</div>
        </Row>
        <Chessground
          width="38vw"
          height="38vw"
          orientation={this.myColor()}
          turnColor={this.turnColor()}
          movable={this.calcMovable()}
          lastMove={lastMove}
          scoreUser={scoreUser}
          scoreCom={scoreCom}
          fen={fen}
          onMove={this.onMove}
          style={{ margin: "auto" }}
        />
        <Row style={{ marginLeft: "31%", paddingTop: "1%", paddingBottom: "1%", marginRight: "31%" }}>
          <Avatar shape="square" style={{ background: "#3c93b0" }} size="large" icon="user" />
          <span style={{ marginLeft: 10, color: "white", verticalAlign: "top" }}>User</span>
          <div style={{ color: "white", float: "right" }}>{mytime}</div>
        </Row>
        <Col style={{ marginTop: "-20%", marginLeft: "5%" }}>
          <Button style={{ fontSize: 20, width: 120, height: 50, background: "#3c93b0", border: 0, color: "white" }} onClick={() => this.reset()}>
            Reset
          </Button>
          <Button
            style={{ marginLeft: 10, fontSize: 20, width: 120, height: 50, background: "#3c93b0", border: 0, color: "white" }}
            onClick={() => this.undo()}
          >
            Undo
          </Button>
        </Col>
        <Modal visible={visibleUserwin} footer={null}>
          <p>Game over,you win by checkmate</p>
        </Modal>
        <Modal visible={visibleComwin} footer={null}>
          <p>Game over, you lose by checkmate</p>
        </Modal>
        <Modal visible={visibleDraw} footer={null}>
          <p>Game over, draw due to stalemate</p>
        </Modal>
        <Modal visible={userTimeout} footer={null}>
          <p>Game over, you lose due to time out</p>
        </Modal>
        <Modal visible={comTimeout} footer={null}>
          <p>Game over, you win due to Computer time out</p>
        </Modal>
        <Modal visible={selectVisible} footer={null}>
          <div>
            <Radio.Group onChange={e => this.onChange(e)} defaultValue="q">
              <Radio.Button value="q">QUEEN</Radio.Button>
              <Radio.Button value="r">ROOK</Radio.Button>
              <Radio.Button value="b">BISHOP</Radio.Button>
              <Radio.Button value="n">KNIGHT</Radio.Button>
            </Radio.Group>
          </div>
        </Modal>
      </div>
    )
  }
}

ReactDOM.render(<Demo />, document.getElementById("root"))
