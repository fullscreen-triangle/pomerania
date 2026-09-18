import type { SlideDef } from "../../../deck/deckTypes";

const Slide04Receiver: SlideDef = {
  title: "Recognition/search and receiver-relativity",
  maxStep: 1,
  render: (step) => (
    <>
      <h2>Neither the corpus nor the querier holds the answer</h2>
      <div className="two-col">
        <div>
          <div className="defn" data-step={0}>
            <h3>Recognition/search identity</h3>
            <p>
              Decoding a query to its claim, and searching for a
              representative query of a target claim, are inverse readings
              of one relation: Dec(q) = v ⟺ q ∈ Proj(v). Neither is
              definable without the other — the answer is the joint fact
              of a decode, not a value sitting in either the document or
              the querier waiting to be read off.
            </p>
          </div>
          <div className={`boxed ${step < 1 ? "dim" : ""}`} data-step={1}>
            <b>Receiver-relativity.</b> The same claim registers a
            different cell — a different resting cut — in different
            receiver graphs, and each registration is correct at that
            graph's own floor. A junior researcher's broad graph and a
            principal investigator's dense, project-saturated graph
            genuinely disagree about which passage is useful for the
            identical query string, and neither is wrong.
          </div>
        </div>
        <div>
          <p className="aside">
            This is why a single global relevance score is not merely
            imprecise — it targets a quantity with no receiver-independent
            referent. A retrieval system computing one score per
            (query, claim) pair, regardless of who is asking, is
            computing something the theorem shows does not exist as a
            fact of the corpus alone.
          </p>
        </div>
      </div>
    </>
  ),
};

export default Slide04Receiver;
