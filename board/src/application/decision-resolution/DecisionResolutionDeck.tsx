import Deck from "../../deck/Deck";
import { slides } from "./slides";

export default function DecisionResolutionDeck() {
  return <Deck slides={slides} backTo="/" backLabel="board" />;
}
