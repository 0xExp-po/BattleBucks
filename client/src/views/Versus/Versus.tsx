import Rock from "../../assets/rock2.png";
import Paper from "../../assets/paper2.png";
import Scissors from "../../assets/scissors2.png";
import Button from "../../components/Button/Button";
import Avatar from "../../components/Avatar";
import { AnimationDefinition, motion, useAnimationControls } from "framer-motion";
import { CSSProperties, useState } from "react";
import "./Versus.scss"

type Item = "rock" | "paper" | "scissors";

const images = {
  "rock": Rock,
  "paper": Paper,
  "scissors": Scissors,
};

const transformIdleBase = "translateY(11em) ";
const transformSelected = "translateY(1em) scale(1.5)";
const transformSelectedFinal = "translateY(1em) scale(1.2)";
const transformSelectedLeft = "translateY(1em) translateX(-5em) scale(1.2)";
const transformSelectedRight = "translateY(1em) translateX(5em) scale(1.2)";

const initialOpponentPosition: AnimationDefinition = {
  opacity: 0,
  translateY: "-5em",
  transition: { duration: 0.3, ease: "easeOut" },
};

const finalOpponentPosition: AnimationDefinition = {
  opacity: 1,
  translateY: 0,
  transition: { duration: 0.3, ease: "easeOut" },
};

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
  const controls = useAnimationControls();

  const [selectedItem, setSelectedItem] = useState<Item>();
  const [state, setState] = useState<GameState>(GameState.IDLE);

  const isChosen = state !== GameState.IDLE;

  function commenceBattle() {
    if (!state == GameState.CHOSEN) return;
    setState(GameState.BATTLE);
    console.log("weee")
    controls.start(finalOpponentPosition);
  }

  function reset() {
    setState(GameState.IDLE);
    setSelectedItem(undefined);
    controls.start(initialOpponentPosition);
  }

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
      <div className="items">
        <Item transform={selectedItem === "rock" ? transforms[state] : transformIdleBase + " translateX(-110%)"} type="rock" onClick={() => !isChosen && setSelectedItem("rock")} />
        <Item transform={selectedItem === "paper" ? transforms[state] : transformIdleBase + " translateX(0%)"} type="paper" onClick={() => !isChosen && setSelectedItem("paper")} />
        <Item transform={selectedItem === "scissors" ? transforms[state] : transformIdleBase + " translateX(110%)"} type="scissors" onClick={() => !isChosen && setSelectedItem("scissors")} />
        <motion.div
          animate={controls}
          style={initialOpponentPosition}
          className="flex center"
        >
          <Item transform={transformSelectedRight} type="scissors" onClick={() => !isChosen && setSelectedItem("scissors")} />
        </motion.div>
      </div>
      <div className="flexRow flex center" style={{ justifyContent: "flex-end" }}>
        <Button type="cancel" onClick={commenceBattle}>TEMP battle</Button>
        <Button type="cancel" onClick={reset}>TEMP reset</Button>
        <Button type="accept" disabled={isChosen} onClick={() => !!selectedItem && setState(GameState.CHOSEN)}>Choose</Button>
      </div>
    </div>
  );
}

interface ItemProps {
  type: Item;
  onClick: React.MouseEventHandler<HTMLDivElement>;
  transform: string;
}

function Item(props: ItemProps) {
  return (
    <div onClick={props.onClick} className={"item " + props.type} style={{ transform: props.transform }}>
      <img src={images[props.type]} className="rps" alt={props.type} />
      <div style={{ textTransform: "uppercase" }}>{props.type}</div>
    </div>
  );
}

export default Versus;
