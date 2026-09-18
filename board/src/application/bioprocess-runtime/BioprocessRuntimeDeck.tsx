import Deck from "../../deck/Deck";
import { slides } from "./slides";

export default function BioprocessRuntimeDeck() {
  return <Deck slides={slides} backTo="/" backLabel="board" />;
}
