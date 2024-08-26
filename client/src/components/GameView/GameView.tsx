//import Rock from "../../assets/rock2.png";
//import Paper from "../../assets/paper2.png";
//import Scissors from "../../assets/scissors2.png";
import Button from "../../components/Button/Button";
import Avatar from "../../components/Avatar";
import { AnimationControls, AnimationDefinition, motion, useAnimationControls } from "framer-motion";
import { CSSProperties, useState } from "react";
import { timeout } from "../../utils/timeout";
import "./Versus.scss"

type Item = "rock" | "paper" | "scissors";

//const images = {
//  rock: Rock,
//  paper: Paper,
//  scissors: Scissors,
//};

const emojis = {
  rock: "🪨",
  paper: "📝",
  scissors: "✂️",
};

const idleStyles = {
  rock: { translateY: "30vh", translateX: "-20vh", fontSize: "1em", transition: { duration: 0.2, ease: "easeOut" } },
  paper: { translateY: "30vh", translateX: "0", fontSize: "1em", transition: { duration: 0.2, ease: "easeOut" } },
  scissors: { translateY: "30vh", translateX: "20vh", fontSize: "1em", transition: { duration: 0.2, ease: "easeOut" } },
};

const styleItemSelected: AnimationDefinition = {
  translateX: "0em",
  translateY: "0vh",
  fontSize: "2em",
  transition: { duration: 0.2, ease: "easeOut" },
};

const styleSelectedFinal: AnimationDefinition = {
  translateX: "0em",
  translateY: "0vh",
  fontSize: "1.5em",
  transition: { duration: 0.2, ease: "easeOut" },
};

const styleMoveLeft: AnimationDefinition = {
  translateX: "-5em",
  translateY: "0vh",
  fontSize: "1.5em",
  transition: { duration: 0.3, ease: "easeOut" },
};

const styleOpponentInitial: AnimationDefinition = {
  opacity: 0,
  translateX: "5em",
  translateY: "-10vh",
  transition: { duration: 0.3, ease: "easeOut" },
  fontSize: "1.5em",
};

const styleOpponentVisible: AnimationDefinition = {
  opacity: 1,
  translateY: 0,
  transition: { duration: 0.3, ease: "easeOut" },
};

const styleWinner: AnimationDefinition = {
  translateX: "0em",
  translateY: "0vh",
  fontSize: "2em",
  transition: { duration: 0.3, ease: "easeOut", delay: 2 },
};

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

// >0 - 1 winner, <0 - 2 winner, =0 - draw
function determineResult(choice1: Item, choice2: Item) {
  if (choice1 === choice2) return 0;
  if (choice1 === "rock" && choice2 === "scissors" ||
    choice1 === "paper" && choice2 === "rock" ||
    choice1 === "scissors" && choice2 === "paper") return 1;
  return -1;
}

function GameView(props: { onGameEnd: (gameData: { result: number, buyin: number }) => void }) {
  const controlsR = useAnimationControls();
  const controlsP = useAnimationControls();
  const controlsS = useAnimationControls();
  const controlsOpponent = useAnimationControls();

  const [selectedItem, setSelectedItem] = useState<Item>();
  const [otherItem, setOtherItem] = useState<Item>();
  const [state, setState] = useState<GameState>(GameState.IDLE);

  const isChosen = state !== GameState.IDLE;

  const controls: { [key: string]: AnimationControls } = {
    rock: controlsR,
    paper: controlsP,
    scissors: controlsS,
  };

  function onGameEnd(gameData: { result: number, buyin: number }) {
    props.onGameEnd(gameData);
  }

  async function onChoose() {
    if (!selectedItem)
      return;
    controls[selectedItem].start(styleSelectedFinal);
    setState(GameState.CHOSEN);
    await timeout(2378);
    commenceBattle();
  }

  function commenceBattle() {
    // if (!state == GameState.CHOSEN) return;
    //const index = Math.floor(Math.random() * 3);
    if (!selectedItem) return;

    const index = 0;
    const otherItem = ["rock", "paper", "scissors"][index] as Item;

    setOtherItem(otherItem);
    setState(GameState.BATTLE);
    controls[selectedItem].start(styleMoveLeft);
    const opponentDownAnimation = controlsOpponent.start(styleOpponentVisible);

    const result = determineResult(selectedItem, otherItem);

    if (result > 0) {
      opponentDownAnimation.then(() => {
        controls[selectedItem].start(styleWinner);
        controlsOpponent.start(hide);
      });
    } else if (result < 0) {
      opponentDownAnimation.then(() => {
        controlsOpponent.start(styleWinner);
        controls[selectedItem].start(hide);
      });
    }

    timeout(4000).then(() => {
      onGameEnd({ result, buyin: 2 });
    });
  }

  function reset() {
    if (state === GameState.IDLE) return;
    if (!selectedItem) return;

    controls[selectedItem].stop();
    controls[selectedItem].start({ translateY: 0, translateX: 0, opacity: 1, scale: 1 });
    controlsOpponent.stop()
    controlsOpponent.start({ translateX: 0, scale: 1 }).then(() => {
      controlsOpponent.start(styleOpponentInitial);
    });
    setState(GameState.IDLE);
    setSelectedItem(undefined);
  }

  const onItemClicked = (item: Item) => {
    if (isChosen) return;
    setSelectedItem(item);
    console.log(item);

    controlsR.start(item === "rock" ? styleItemSelected : idleStyles["rock"]);
    controlsP.start(item === "paper" ? styleItemSelected : idleStyles["paper"]);
    controlsS.start(item === "scissors" ? styleItemSelected : idleStyles["scissors"]);
  }

  return (
    <div className="flexCol flex" style={{ margin: "1em", overflowX: "hidden" }}>
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
        <Item controls={controlsR} initialStyle={idleStyles["rock"]} type="rock" onClick={() => onItemClicked("rock")} />
        <Item controls={controlsP} initialStyle={idleStyles["paper"]} type="paper" onClick={() => onItemClicked("paper")} />
        <Item controls={controlsS} initialStyle={idleStyles["scissors"]} type="scissors" onClick={() => onItemClicked("scissors")} />
        <Item controls={controlsOpponent} initialStyle={styleOpponentInitial} type={otherItem ?? "rock"} />
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
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  controls: AnimationControls;
  initialStyle?: CSSProperties | AnimationDefinition;
}

function Item(props: ItemProps) {
  return (
    <motion.div animate={props.controls} style={props.initialStyle as CSSProperties} className="flex center absolute">
      <div onClick={props.onClick} className={`${props.onClick ? "itemClickable" : ""} item ${props.type}`} style={{ userSelect: "none" }}>
        {/* <img src={images[props.type]} className="rps" alt={props.type} /> */}
        <div style={{ fontSize: "2em" }}>{emojis[props.type]}</div>
        <div style={{ textTransform: "uppercase" }}>{props.type}</div>
      </div>
    </motion.div>
  );
}

export default GameView;
