import Button from "../components/Button";
import Pill from "../components/Pill";

function MatchHistory() {
  const fights = [
    { name: "Fight1", score: 15, mode: "1v1", won: true },
    { name: "Fight2", score: 25, mode: "1v1", won: false },
  ];

  return (
    <div className="flexCol flex" style={{ margin: "3em 1em", gap: "1em" }}>
      <h2>Match history:</h2>
      <div className="flexRow" style={{ gap: "1em" }}>
        <Button className="flex">Battle Royale</Button>
        <Button className="flex">1v1</Button>
      </div>
      <Pill style={{ gap: "1em" }}>
        {fights.map((fight, i) => (
          <Pill key={i} className="flex" style={{ width: "100%" }}>
            <div>{fight.name}, {fight.mode}:</div>
            <div>{fight.score}, {fight.won ? "WIN" : "LOSS"}</div>
          </Pill>
        ))}
      </Pill>
    </div>
  );
}

export default MatchHistory;
