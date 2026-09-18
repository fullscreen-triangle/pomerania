import Deck from "../../deck/Deck";
import { slides } from "./slides";

export default function AbsichtDeck() {
  return <Deck slides={slides} backTo="/" backLabel="board" />;
}
