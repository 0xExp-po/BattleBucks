import Rock from "../../assets/rock2.png";
import Paper from "../../assets/paper2.png";
import Scissors from "../../assets/scissors2.png";
import Button from "../../components/Button/Button";
import Avatar from "../../components/Avatar";
import { AnimationDefinition, motion, useAnimationControls } from "framer-motion";
import { CSSProperties, useEffect, useState } from "react";
import "./Versus.scss"
import { useNavigate } from "react-router";
import { timeout } from "../../utils/timeout";

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

const bumpLeft: AnimationDefinition = {
  translateX: "-5em",
  scale: 1.2,
  transition: { duration: 0.3, ease: "easeOut", delay: 2 },
}

const bumpRight: AnimationDefinition = {
  translateX: "5em",
  scale: 1.2,
  transition: { duration: 0.3, ease: "easeOut", delay: 2 },
}

const hide: AnimationDefinition = {
  opacity: 0,
  translateY: "-5em",
  transition: { duration: 0.3, ease: "easeOut", delay: 2 },
};

enum GameState {
  IDLE,
  CHOSEN,
  BATTLE,
};

const transforms = {
  [GameState.IDLE]: transformSelected,
  [GameState.CHOSEN]: transformSelectedFinal,
  [GameState.BATTLE]: transformSelectedLeft,
}

// >0 - 1 winner, <0 - 2 winner, =0 - draw
function determineResult(choice1: Item, choice2: Item) {
  if (choice1 === choice2) return 0;
  if (choice1 === "rock" && choice2 === "scissors" ||
    choice1 === "paper" && choice2 === "rock" ||
    choice1 === "scissors" && choice2 === "paper") return 1;
  return -1;
}

function Versus() {
  const navigate = useNavigate();

  const controlsR = useAnimationControls();
  const controlsP = useAnimationControls();
  const controlsS = useAnimationControls();
  const controlsOpponent = useAnimationControls();

  const [selectedItem, setSelectedItem] = useState<Item>();
  const [otherItem, setOtherItem] = useState<Item>();
  const [state, setState] = useState<GameState>(GameState.IDLE);

  const isChosen = state !== GameState.IDLE;

  const controls: { [key: Item]: AnimationControls } = {
    rock: controlsR,
    paper: controlsP,
    scissors: controlsS,
  };

  async function onChoose() {
    if (!selectedItem)
      return;
    setState(GameState.CHOSEN);
    await timeout(2378);
    console.log(state)
    commenceBattle();
  }

  function commenceBattle() {
    // if (!state == GameState.CHOSEN) return;
    //const index = Math.floor(Math.random() * 3);
    const index = 0;
    const otherItem = ["rock", "paper", "scissors"][index];

    setOtherItem(otherItem);
    setState(GameState.BATTLE);
    const opponentDownAnimation = controlsOpponent.start(finalOpponentPosition);

    const result = determineResult(selectedItem, otherItem);

    if (result > 0) {
      opponentDownAnimation.then(() => {
        controls[selectedItem].start(bumpRight);
        controlsOpponent.start(hide);
      });
    } else if (result < 0) {
      opponentDownAnimation.then(() => {
        controlsOpponent.start(bumpLeft);
        controls[selectedItem].start(hide);
      });
    }

    timeout(4000).then(() => {
      const gameData = { result, buyin: 2 };
      navigate("/end", { state: { game: gameData } });
    });
  }

  function reset() {
    if (state === GameState.IDLE) return;
    controls[selectedItem].stop();
    controls[selectedItem].start({ translateY: 0, translateX: 0, opacity: 1, scale: 1 });
    controlsOpponent.stop()
    controlsOpponent.start({ translateX: 0, scale: 1 }).then(() => {
      controlsOpponent.start(initialOpponentPosition);
    });
    setState(GameState.IDLE);
    setSelectedItem(undefined);
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
        <Item controls={controlsR} transform={selectedItem === "rock" ? transforms[state] : transformIdleBase + " translateX(-110%)"} type="rock" onClick={() => !isChosen && setSelectedItem("rock")} />
        <Item controls={controlsP} transform={selectedItem === "paper" ? transforms[state] : transformIdleBase + " translateX(0%)"} type="paper" onClick={() => !isChosen && setSelectedItem("paper")} />
        <Item controls={controlsS} transform={selectedItem === "scissors" ? transforms[state] : transformIdleBase + " translateX(110%)"} type="scissors" onClick={() => !isChosen && setSelectedItem("scissors")} />
        <Item controls={controlsOpponent} initialStyle={initialOpponentPosition} transform={transformSelectedRight} type={otherItem ?? "rock"} onClick={() => !isChosen && setSelectedItem("scissors")} />
      </div>

      <div className="flexRow flex center" style={{ justifyContent: "flex-end" }}>
        {/* <Button type="cancel" onClick={() => controls[selectedItem].start(hide)}>TEMP </Button>
        <Button type="cancel" onClick={commenceBattle}>TEMP battle</Button>
        <Button type="cancel" onClick={reset}>TEMP reset</Button> */}
        <Button type="accept" disabled={isChosen} onClick={onChoose}>Choose</Button>
      </div>
    </div>
  );
}

interface ItemProps {
  type: Item;
  onClick: React.MouseEventHandler<HTMLDivElement>;
  transform: string;
  controls: AnimationControls;
  initialStyle?: MotionStyle;
}

function Item(props: ItemProps) {
  return (
    <motion.div animate={props.controls} style={props.initialStyle} className="flex center absolute">
      <div onClick={props.onClick} className={"item " + props.type} style={{ transform: props.transform }}>
        <img src={images[props.type]} className="rps" alt={props.type} />
        <div style={{ textTransform: "uppercase" }}>{props.type}</div>
      </div>
    </motion.div>
  );
}

export default Versus;
