/*
const args = process.argv.slice(2);
const start_id = Number(args[0]) || 0;
const end_id = Number(args[1]) || 2400000000;
const JSONStream = require('JSONStream');
const constants = require('dotaconstants');
const db = require('../store/db');
const cassandra = require('../store/cassandra');
const redis = require('../store/redis');
const utility = require('../util/utility');
const async = require('async');
const serialize = utility.serialize;
const cluster = require('cluster');
const bucket_size = 100000000;
if (cluster.isMaster) {
    // Fork workers.
  for (let i = start_id; i < end_id; i += bucket_size) {
    cluster.fork(
      {
        BUCKET: i,
      });
  }
  cluster.on('exit', (worker, code, signal) => {
    if (code !== 0) {
      throw 'worker died';
    } else {
      console.log('worker exited successfully');
    }
  });
} else {
  var bucket = Number(process.env.BUCKET);
  redis.get(`postgresToCassandra:${bucket}`, (err, result) => {
    if (err) {
      throw err;
    }
    result = result ? Number(result) : bucket;
    run(result);
  });
}

function run(start_id) {
  const stream = db.select()
  .from('matches')
  .where('match_id', '>=', start_id)
  .where('match_id', '<', bucket + bucket_size)
  .orderBy('match_id', 'asc')
  .stream();
  stream.on('end', exit);
  stream.pipe(JSONStream.parse());
  stream.on('data', (match) => {
    stream.pause();
    redis.set(`postgresToCassandra:${bucket}`, match.match_id);
    delete match.parse_status;
    insertMatch(match, (err) => {
      if (err) {
        return exit(err);
      }

      db.select([
      'player_matches.match_id',
      'player_matches.account_id',
      'player_slot',
      'hero_id',
      'item_0', 'item_1', 'item_2', 'item_3', 'item_4', 'item_5',
      'kills', 'deaths', 'assists', 'leaver_status', 'gold', 'last_hits', 'denies',
      'gold_per_min', 'xp_per_min', 'gold_spent', 'hero_damage', 'tower_damage', 'hero_healing',
      'level', 'additional_units', 'stuns', 'max_hero_hit', 'times', 'gold_t', 'lh_t', 'xp_t',
      'obs_log', 'sen_log', 'purchase_log', 'kills_log', 'buyback_log', 'lane_pos', 'obs', 'sen',
      'actions', 'pings', 'purchase', 'gold_reasons', 'xp_reasons', 'killed',
      'item_uses', 'ability_uses', 'hero_hits', 'damage', 'damage_taken', 'damage_inflictor',
      'runes', 'killed_by', 'kill_streaks', 'multi_kills', 'life_state'])
      .from('player_matches')
      .join('matches', 'player_matches.match_id', 'matches.match_id')
      .where('matches.match_id', '=', match.match_id)
      .asCallback((err, pms) => {
        if (err) {
          return exit(err);
        }
        async.each(pms, insertPlayerMatch, (err) => {
          if (err) {
            return exit(err);
          }
          match.players = pms;
          updateCache(match, (err) => {
            if (err) {
              return exit(err);
            }
            console.log(match.match_id);
            stream.resume();
          });
        });
      });
    });
  });

  function exit(err) {
    if (err) {
      console.error(err);
    }
    process.exit(err ? 1 : 0);
  }

  function insertMatch(match, cb) {
    const obj = serialize(match);
    delete obj.pgroup;
    const query = 'INSERT INTO matches JSON ?';
    cassandra.execute(query, [JSON.stringify(obj)],
      {
        prepare: true,
      }, cb);
  }

  function insertPlayerMatch(pm, cb) {
    if (pm.account_id === constants.anonymous_account_id) {
      delete pm.account_id;
    }
    const obj2 = serialize(pm);
    const query2 = 'INSERT INTO player_matches JSON ?';
    cassandra.execute(query2, [JSON.stringify(obj2)],
      {
        prepare: true,
      }, cb);
  }
}
*/
