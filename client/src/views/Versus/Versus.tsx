import Rock from "../../assets/rock2.png";
import Paper from "../../assets/paper2.png";
import Scissors from "../../assets/scissors2.png";
import "./Versus.scss"
import Button from "../../components/Button/Button";
import Avatar from "../../components/Avatar";
import { CSSProperties, useState } from "react";

type Item = "rock" | "paper" | "scissors";

const transformIdleBase = "translateY(11em) ";
const transformSelected = "translateY(1em) scale(1.5)";
const transformSelectedFinal = "translateY(1em) scale(1.2)";
const transformSelectedLeft = "translateY(1em) translateX(-5em) scale(1.2)";
const transformSelectedRight = "translateY(1em) translateX(5em) scale(1.2)";

enum GameState {
  IDLE,
  CHOSEN,
  BATTLE,
}
const transforms = {
  [GameState.IDLE]: transformSelected,
  [GameState.CHOSEN]: transformSelectedFinal,
  [GameState.BATTLE]: transformSelectedLeft,
}

function Versus() {
  const [selectedItem, setSelectedItem] = useState<Item>();
  const [state, setState] = useState<GameState>(GameState.IDLE);

  const isChosen = state !== GameState.IDLE;

  return (
    <div className="flexCol flex" style={{ margin: "1em" }}>
      <div className="flexRow center" style={{ gap: "0.25em", marginBottom: "2em" }}>
        <div className="flex flexCol center">
          <h3 style={{ color: "rgb(229, 243, 255)" }}>Player1</h3>
          <Avatar size="3em" />
        </div>
        <div className="flex center">vs</div>
        <div className="flex flexCol center">
          <h3 style={{ color: "rgb(229, 243, 255)" }}>Player2</h3>
          <Avatar size="3em" />
        </div>
      </div>
      <div className="bar"></div>
      <div className="flexRow center" style={{ flex: 5 }}>
        <div className="table"></div>
      </div>
      <div className="items" style={{ transform: "translateY(0)" }}>
        <Item state={state} selected={selectedItem === "rock"} transformIdle={transformIdleBase + " translateX(-110%)"} name="rock" className="rock" img={Rock} onClick={() => !isChosen && setSelectedItem("rock")} />
        <Item state={state} selected={selectedItem === "paper"} transformIdle={transformIdleBase + " translateX(0%)"} name="paper" className="paper" img={Paper} onClick={() => !isChosen && setSelectedItem("paper")} />
        <Item state={state} selected={selectedItem === "scissors"} transformIdle={transformIdleBase + " translateX(110%)"} name="scissors" className="scissors" img={Scissors} onClick={() => !isChosen && setSelectedItem("scissors")} />
      </div>
      <div className="flexRow flex center" style={{ justifyContent: "flex-end" }}>
        <Button type="cancel" onClick={() => { setState(GameState.BATTLE); }}>TEMP battle</Button>
        <Button type="cancel" onClick={() => { setSelectedItem(undefined); setState(GameState.IDLE); }}>TEMP reset</Button>
        <Button type="accept" disabled={isChosen} onClick={() => !!selectedItem && setState(GameState.CHOSEN)}>Choose</Button>
      </div>
    </div>
  );
}

interface ItemProps {
  name: string;
  img: string;
  className: string;
  onClick: React.MouseEventHandler<HTMLDivElement>;
  selected: boolean;
  state: GameState;
  transformIdle: string;
}

function Item(props: ItemProps) {
  const transform = props.selected ? transforms[props.state] : props.transformIdle;

  return (
    <div
      onClick={props.onClick}
      className={"item " + props.className}
      style={{ transform }}
    >
      <img src={props.img} className="rps" alt={props.name} />
      <div style={{ textTransform: "uppercase" }}>{props.name}</div>
    </div>
  );
}

export default Versus;
