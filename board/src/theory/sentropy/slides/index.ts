import type { SlideDef } from "../deckTypes";
import Slide01Title from "./Slide01Title";
import Slide02Question from "./Slide02Question";
import Slide03WhatIs from "./Slide03WhatIs";
import Slide04GraphCutMinCut from "./Slide04GraphCutMinCut";
import Slide05Pendulum from "./Slide05Pendulum";
import Slide06Entropy from "./Slide06Entropy";
import Slide07Floor from "./Slide07Floor";
import Slide08Regional from "./Slide08Regional";
import Slide09WhyThree from "./Slide09WhyThree";
import Slide10Coordinates from "./Slide10Coordinates";
import Slide11Metric from "./Slide11Metric";
import Slide12LevelsConcretely from "./Slide12LevelsConcretely";
import Slide13Recursion from "./Slide13Recursion";
import Slide14Closure from "./Slide14Closure";
import Slide15Blindness from "./Slide15Blindness";
import Slide16Society from "./Slide16Society";
import Slide17Limits from "./Slide17Limits";

// Order matches the original 17-slide deck exactly:
// Foundations: 1 title, 2 question, F1 what-is, F2 graph/cut, F3 pendulum, F4 entropy
// Derivation: 3 floor, 4 regional, 5 why-three, 6 coordinates, 7 metric,
//             F5 levels-concretely, 8 recursion
// Payload: 9 closure, 10 blindness, 11 society, 12 limits
export const slides: SlideDef[] = [
  Slide01Title,
  Slide02Question,
  Slide03WhatIs,
  Slide04GraphCutMinCut,
  Slide05Pendulum,
  Slide06Entropy,
  Slide07Floor,
  Slide08Regional,
  Slide09WhyThree,
  Slide10Coordinates,
  Slide11Metric,
  Slide12LevelsConcretely,
  Slide13Recursion,
  Slide14Closure,
  Slide15Blindness,
  Slide16Society,
  Slide17Limits,
];
