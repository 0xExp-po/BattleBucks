import Rock from "../../assets/rock.png";
import Paper from "../../assets/paper.png";
import Scissors from "../../assets/scissors.png";
import "./Versus.scss"

function Versus() {
  return (
    <div className="flexCol flex" style={{ margin: "1em", flex: 1 }}>
      <div className="flexRow center" style={{ gap: "0.25em", marginBottom: "2em" }}>
        <div className="flex" style={{ color: "rgb(238, 188, 188)" }}><h3>Player1</h3></div>
        <div className="flex center">vs</div>
        <div className="flex" style={{ color: "rgb(238, 188, 188)" }}><h3>Player2</h3></div>
      </div>
      <div className="flexRow center">
        <div className="table"></div>
      </div>
      <div className="bar"></div>
      <div className="flexRow center">
        <div className="table"></div>
      </div>
      <div style={{ flex: 0, maxWidth: "100%", gap: "0.5em" }} className="flex center">
        <div className="selectable rock">
          <img src={Rock} className="rps" alt="React logo" />
          <div>ROCK</div>
        </div>
        <div className="selectable paper">
          <img src={Paper} className="rps" alt="React logo" />
          <div>PAPER</div>
        </div>
        <div className="selectable scissors">
          <img src={Scissors} className="rps" alt="React logo" />
          <div>SCISSORS</div>
        </div>
      </div>
    </div>
  );
}

export default Versus;
