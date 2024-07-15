import Rock from "../../assets/rock.png";
import Paper from "../../assets/paper.png";
import Scissors from "../../assets/scissors.png";
import "./Versus.scss"
import Button from "../../components/Button/Button";
import Avatar from "../../components/Avatar";
import { useState } from "react";

type Item = "rock" | "paper" | "scissors";

function Versus() {
  const [selectedItem, setSelectedItem] = useState<Item>();
  const [isChosen, setIsChosen] = useState(false);

  console.log(selectedItem, isChosen);

  return (
    <div className="flexCol flex" style={{ margin: "1em" }}>
      <div className="flexRow center" style={{ gap: "0.25em", marginBottom: "2em" }}>
        <div className="flex flexCol center">
          <h3 style={{ color: "rgb(238, 188, 188)" }}>Player1</h3>
          <Avatar size="3em" />
        </div>
        <div className="flex center">vs</div>
        <div className="flex flexCol center">
          <h3 style={{ color: "rgb(238, 188, 188)" }}>Player2</h3>
          <Avatar size="3em" />
        </div>
      </div>
      <div className="flexRow center">
        <div className="table"></div>
      </div>
      <div className="bar"></div>
      <div className="flexRow center">
        <div className="table"></div>
      </div>
      <div style={{ flex: 0, maxWidth: "100%", gap: "0.5em" }} className="flex center">
        <Item name="rock" className="rock" img={Rock} onClick={() => !isChosen && setSelectedItem("rock")} />
        <Item name="paper" className="paper" img={Paper} onClick={() => !isChosen && setSelectedItem("paper")} />
        <Item name="scissors" className="scissors" img={Scissors} onClick={() => !isChosen && setSelectedItem("scissors")} />
      </div>
      <div className="flexRow flex center" style={{ justifyContent: "flex-end" }}>
        <Button type="accept" disabled={isChosen} onClick={() => !!selectedItem && setIsChosen(true)}>Choose</Button>
      </div>
    </div>
  );
}

interface ItemProps {
  name: string;
  img: string;
  className: string;
  onClick: React.MouseEventHandler<HTMLDivElement>;
}

function Item(props: ItemProps) {
  return (
    <div onClick={props.onClick} className={"item " + props.className}>
      <img src={props.img} className="rps" alt={props.name} />
      <div style={{ textTransform: "uppercase" }}>{props.name}</div>
    </div>
  );
}

export default Versus;
