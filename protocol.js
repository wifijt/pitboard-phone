// The phone link's protocol -- the phone's side of pitboard/link.py (read that for the format).
// An ES module: phone/index.html uses it in the browser; tests/link_js_test.mjs runs it in Node
// against the Python side, so the two can't drift apart unnoticed.

export const SERVICE_UUID = '5459b00d-7a1d-4c3e-9a55-000000005459';
export const RX_UUID      = '5459b00d-7a1d-4c3e-9a55-0000000000a1';
export const TX_UUID      = '5459b00d-7a1d-4c3e-9a55-0000000000a2';
export const FRAME        = 180;

// TBA matches -> compact rows: [key, level, set, number, time, predicted, actual, post_result,
// [red], [blue], red score, blue score, winner, red rp, blue rp]
export function compactMatches(matches) {
  return matches.map(m => {
    const a = m.alliances, sb = m.score_breakdown || {};
    const nums = keys => keys.map(k => parseInt(k.slice(3), 10));
    return [m.key, m.comp_level, m.set_number ?? null, m.match_number, m.time ?? null,
            m.predicted_time ?? null, m.actual_time ?? null, m.post_result_time ?? null,
            nums(a.red.team_keys), nums(a.blue.team_keys), a.red.score ?? null, a.blue.score ?? null,
            m.winning_alliance || '', (sb.red || {}).rp ?? null, (sb.blue || {}).rp ?? null];
  });
}

// TBA rankings -> [rank, team, first sort value, wins, losses, ties]
export function compactRankings(r) {
  if (!r || !r.rankings) return null;
  return r.rankings.map(x => [x.rank, parseInt(x.team_key.slice(3), 10), (x.sort_orders || [0])[0],
                              x.record ? x.record.wins : 0, x.record ? x.record.losses : 0,
                              x.record ? x.record.ties : 0]);
}

// The event, trimmed to what the board shows.
export function compactEvent(e) {
  if (!e) return null;
  const keep = ['key', 'name', 'short_name', 'city', 'start_date', 'end_date', 'timezone', 'event_type'];
  return Object.fromEntries(keep.filter(k => k in e).map(k => [k, e[k]]));
}

async function deflate(bytes) {
  // zlib format ("deflate" in the Compression Streams API) -- what Python's zlib reads
  const cs = new CompressionStream('deflate');
  const out = new Blob([bytes]).stream().pipeThrough(cs);
  return new Uint8Array(await new Response(out).arrayBuffer());
}

// A message -> the frames to write, in order.
export async function frames(obj, msgId) {
  const body = await deflate(new TextEncoder().encode(JSON.stringify(obj)));
  const size = FRAME - 4, out = [];
  const n = Math.max(1, Math.ceil(body.length / size));
  for (let k = 0; k < n; k++) {
    const chunk = body.slice(k * size, (k + 1) * size);
    const f = new Uint8Array(4 + chunk.length);
    f[0] = msgId & 255; f[1] = k >> 8; f[2] = k & 255; f[3] = k === n - 1 ? 1 : 0;
    f.set(chunk, 4);
    out.push(f);
  }
  return out;
}
