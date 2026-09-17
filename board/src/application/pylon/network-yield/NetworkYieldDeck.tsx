import Deck from "../../../deck/Deck";
import { slides } from "./slides";

export default function NetworkYieldDeck() {
  return <Deck slides={slides} backTo="/application/pylon" backLabel="pylon" />;
}
