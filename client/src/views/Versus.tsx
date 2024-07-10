import Rock from "../assets/rock.png";
import Paper from "../assets/paper.png";
import Scissors from "../assets/scissors.png";
import Button from "../components/Button/Button";

function Versus() {
  return (
    <div className="flexCol flex" style={{ margin: "1em" }}>
      <div style={{ display: "flex", gap: "0.25em", marginBottom: "2em" }}>
        <Button className="flex"><div style={{ fontSize: "1em" }}>Balance: <b>$250</b></div></Button>
        <Button className="flex">
          <div style={{ fontSize: "0.7em" }}>Selected mode</div>
          <div style={{ fontWeight: "bold" }}>Normal</div>
        </Button>
      </div>
      <h2 className="flex center">Waiting for opponent...</h2>
      <div style={{ flex: 2 }} className="flex center">
        <h1>Choose!</h1>
      </div>
      <div style={{ flex: 0, maxWidth: "100%" }} className="flex center">
        <div className="selectable">
          <img src={Rock} className="rps rock" alt="React logo" />
        </div>
        <div className="selectable">
          <img src={Paper} className="rps paper" alt="React logo" />
        </div>
        <div className="selectable">
          <img src={Scissors} className="rps scissors" alt="React logo" />
        </div>
      </div>
    </div>
  );
}

export default Versus;
