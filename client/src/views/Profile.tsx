import Button from "../components/Button/Button";
import Pill from "../components/Pill";
import Avatar from "../components/Avatar";

function Profile() {
  const fights = [
    { result: "won", myItem: "Scissors", opponentItem: "Paper", change: 5 },
    { result: "loss", myItem: "Rock", opponentItem: "Paper", change: -5 },
    { result: "draw", myItem: "Rock", opponentItem: "Paper", change: 0 },
  ];

  const status: { [key: string]: string } = {
    "won": "win",
    "loss": "loss",
    "draw": "draw",
  };

  return (
    <div className="flexCol flex" style={{ margin: "3em 1em", gap: "1em" }}>
      <div className="flexRow flex" style={{ gap: "1em" }}>
        <Pill className="flex">
          <Avatar />
          <h3>Player</h3>
          <h4>Level 4 - 3340 XP</h4>
        </Pill>
        <div className="flexCol flex" style={{ gap: "1em" }}>
          <Pill className="flex">
            <div style={{ fontSize: "0.7em" }}>Balance:</div>
            <div style={{ fontWeight: "bold" }}>$250</div>
          </Pill>
          <Pill className="flex">
            <div style={{ fontSize: "0.7em" }}>Win Rate:</div>
            <div style={{ fontWeight: "bold" }}>63%</div>
          </Pill>
          <Pill className="flex">
            <div style={{ fontSize: "0.7em" }}>Most Played Mode:</div>
            <div style={{ fontWeight: "bold" }}>1v1 (57%)</div>
          </Pill>
        </div>
      </div>
      <div className="flexCol flex">
        <Pill className="flexCol" style={{ gap: "0.5em" }}>
          <div style={{ fontWeight: "bold" }}>Distribution of Items Picked:</div>
          <div className="flexRow flex" style={{ width: "100%" }}>
            <div className="flexCol flex">
              <div style={{ fontSize: "0.7em" }}>Rock:</div>
              <div style={{ fontWeight: "bold" }}>30%</div>
            </div>
            <div className="flexCol flex">
              <div style={{ fontSize: "0.7em" }}>Paper:</div>
              <div style={{ fontWeight: "bold" }}>35%</div>
            </div>
            <div className="flexCol flex">
              <div style={{ fontSize: "0.7em" }}>Scissors:</div>
              <div style={{ fontWeight: "bold" }}>35%</div>
            </div>
          </div>
        </Pill>
        <div style={{ margin: "1em" }}>
          <h3>Match history:</h3>
        </div>
        <div className="flexRow" style={{ gap: "1em" }}>
          <Button className="flex">Battle Royale</Button>
          <Button className="flex">1v1</Button>
        </div>
        <Pill style={{ marginTop: "1em", gap: "1em" }}>
          <div className="flexRow" style={{ fontWeight: "bold" }}>
            <div className="flex center">My Choice</div>
            <div className="flex center">Opponent's Choice</div>
            <div className="flex center">Balance Change</div>
          </div>
          {fights.map((fight, i) => (
            <Pill key={i} className="flex" style={{ width: "100%", overflow: "hidden", padding: 0 }}>
              <div className={status[fight.result]} style={{ width: "100%" }}>
                <div className="flexRow" style={{ margin: "1em" }}>
                  <div className="flex center">{fight.myItem}</div>
                  <div className="flex center">{fight.opponentItem}</div>
                  <div className="flex center">{(fight.change >= 0 ? "+" : "") + fight.change}</div>
                </div>
              </div>
            </Pill>
          ))}
        </Pill>
      </div>
    </div >
  );
}

export default Profile;
