require('dotenv').config();
const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const url = process.env.MONGODB_URI
const port = process.env.PORT || 3001
const app = express();
app.use(express.static('../src'));
app.use(express.static('../node_modules'));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/scores', (req, res) => {
  MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true  }, function(err, db) {
    if (err) throw err;
    const dbo = db.db('zenter');
    dbo.collection('scores').find({}).sort({ score: -1, _id: -1 }).limit(10).toArray(function(err, result) {
      if (err) throw err;
      res.send(result);
      db.close();
    });
  });
});

app.get('/get-new-record-threshold', (req, res) => {
  MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, db) {
    if (err) throw err;
    const dbo = db.db('zenter');
    dbo.collection('scores').find({}).sort({ score: 1 }).limit(1).toArray(function(err, result) {
      if (err) throw err;
      res.send(result);
      db.close();
    });
  });
});

app.post('/check-for-new-record', (req, res) => {
  const score = req.body.score;
  MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, db) {
    if (err) throw err;
    const dbo = db.db('zenter');
    dbo.collection('scores').find({}).sort({ score: 1 }).limit(1).toArray(function(err, result) {
      if (err) throw err;
      if (score >= result[0].score) {
        res.sendFile(__dirname + '/new_record.html');
      } else {
        res.send('false');
      }
      db.close();
    });
  });
});

function insertNewRecord(recordData, callback) {
  let inserted = 0;
  MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, db) {
    if (err) throw err;
    const dbo = db.db('zenter');
    dbo.collection('scores').insertOne(recordData, function(err, res) {
      if (err) throw err;
      inserted = res.insertedId;
      dbo.collection('scores').find({}).sort({ score: -1, _id: -1 }).limit(10).toArray(function(err, result) {
        if (err) throw err;
        const topTenIds = result.map(e => e._id);
        dbo.collection('scores').deleteMany({ _id: { $nin: topTenIds } });
        db.close();
      });
      return callback(null, inserted);
    });
  });
}

async function validateNewRecord(name,flag,score) {
  //trim white spaces at the beginning and end of string
  let validName = name.trim();
  let validFlag = flag.trim();
  let validScore = score;

  //return false if length of any element is outside of standard (exception for name lenght because of HTML input maxlength attribute not 100% support)
  if (validName.length < 1 || validFlag.length !== 2 || validScore < 1 || validScore > 100) {
    return false;
  }

  //return false if score is not a number
  if (Number.isNaN(validScore) || !Number.isFinite(validScore)) {
    return false;
  }

  //return false if flag or score have non admitted format
  if (/\b[a-z]{2}\b/g.test(validFlag) === false || /^[1-9]{1}[0-9]{1}(\.\d)?$|^100$/.test(validScore) === false) {
    return false;
  }

  //truncate name string if it bypassed the maxlength limit for whatever reason
  if (validName.length > 10) {
    validName = validName.substring(0, 10);
  }

  //Convert any html char to html entities
  validName = validName.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&quot;')
    .replace(/'/g, '&#039;');

  return { name: validName, score: validScore, flag: validFlag };

}

app.post('/new-record', (req, res) => {
  const name = req.body.name;
  const flag = req.body.flag;
  const score = req.body.score;
  const recordData = validateNewRecord(name, flag, score);

  recordData.then(data => {
    if (data !== false) {
      insertNewRecord(data, function(error, inserted) {
        res.send(JSON.stringify(inserted));
      });
    } else {
      res.send('false');
    }
  });

});

app.listen(port, () => {
  console.log(`listening on ${port}`);
});