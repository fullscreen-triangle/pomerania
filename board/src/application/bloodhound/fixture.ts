/**
 * A small, illustrative federation fixture: two repos worth of source-like
 * text, enough for the in-browser χ engine to build a real graph and find a
 * real minimum cut. This stands in for a live GitHub/local fetch (which
 * needs a token and a filesystem respectively) so the demo runs from a
 * cold page load with nothing installed.
 */

export interface FixtureFile {
  path: string;
  text: string;
}

export const TRACKER_FIXTURE: FixtureFile[] = [
  {
    path: "tracker/src/registry.rs",
    text: `
pub struct Registry {
    repos: Vec<RepoHandle>,
}
pub fn add_repo(path: &str) -> RepoHandle { RepoHandle::new(path) }
pub fn list_repos(registry: &Registry) -> Vec<String> { vec![] }
fn load_federation_root() -> Registry { Registry { repos: vec![] } }
`,
  },
  {
    path: "tracker/src/chi.rs",
    text: `
pub fn compute_character(index: &SelfGraph) -> Character { stoer_wagner_min_cut(index) }
fn stoer_wagner_min_cut(graph: &SelfGraph) -> Character { Character::default() }
pub fn salient_surface(character: &Character) -> Vec<Block> { vec![] }
fn build_block_graph(registry: &Registry) -> SelfGraph { SelfGraph::default() }
`,
  },
  {
    path: "tracker/src/history.rs",
    text: `
pub struct History { m: u64 }
pub fn increment(history: &mut History) { history.m += 1; }
fn never_decrement(history: &History) -> bool { true }
pub fn committed_count(history: &History) -> u64 { history.m }
`,
  },
  {
    path: "tracker/src/federation.rs",
    text: `
use crate::registry::Registry;
use crate::chi::compute_character;
pub struct Federation { registry: Registry }
pub fn society_invariant(federation: &Federation) -> f64 { 0.0 }
fn build_society_graph(federation: &Federation) -> SocietyGraph { SocietyGraph::default() }
pub fn drift(federation: &Federation, repo: &str) -> bool { false }
`,
  },
  {
    path: "tracker/docs/tracker-cli.md",
    text: `
# tracker init
## tracker add
### tracker sense
#### tracker federation
`,
  },
  {
    path: "purpose/src/index.rs",
    text: `
pub fn purpose_index(root: &str) -> SelfGraph { SelfGraph::default() }
pub fn purpose_ask(query: &str, index: &SelfGraph) -> Vec<Hit> { vec![] }
fn rank_by_substring(query: &str, index: &SelfGraph) -> Vec<Hit> { vec![] }
`,
  },
  {
    path: "purpose/src/lib.rs",
    text: `
pub struct SelfGraph { symbols: Vec<Symbol> }
pub fn load_index(path: &str) -> SelfGraph { SelfGraph { symbols: vec![] } }
`,
  },
];

export const WIND_TUNNEL_FIXTURE_NOTE =
  "The Bloodhound tracker fixture above stands in for a real `purpose index` / GitHub tree walk.";
