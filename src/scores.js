/* const buttonScoreboard = document.getElementById('show_scores');
buttonScoreboard.addEventListener('click', showScoreboard);*/
const containerScoreboard = document.getElementById('container_scoreboard');
//containerScoreboard.addEventListener('click', showScoreboard); 
const scoreboardHeader = document.getElementById('scoreboard_header');
const scoreboardBody = document.getElementById('scoreboard');
const containerNewRecord = document.getElementById('container_new_record');

let newRecordThreshold = 60; //setting a default minimum threshold in case setNewRecordThreshold() fails
function setNewRecordThreshold() {
  fetch('/get-new-record-threshold', { method: 'GET' })
    .then(function(response) {
      if(response.ok) return response.json();
      throw new Error('Request failed.');
    })
    .then(function(data) {
      newRecordThreshold = data[0].score;
    })
    .catch((err) => console.log(err));
};

function checkScoreboardHeadingFit() {
  /*  if (scoreboardBody.offsetHeight > containerScoreboard.offsetHeight * 0.77) {
    scoreboardHeader.style.display = 'none';
  } else {
    scoreboardHeader.style.display = 'block';
  } */
}

function showScoreboard(record_id) {
  if (containerScoreboard.style.display === 'flex') {
    containerScoreboard.style.display = 'none';
    if (roundCount === 0) {clickToStart()}
    return;
  } else {
    if (roundCount === 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      clearInterval(clickToStartFlashingMessage);
      clickToStartFlashingMessage = null;
    }
    containerScoreboard.style.display = 'flex';
  }

  fetch('/scores', { method: 'GET' })
    .then(function(response) {
      if(response.ok) return response.json();
      throw new Error('Request failed.');
    })
    .then(function(data) {
      scoreboardBody.innerHTML = '';
      let count = 1;
      for (let o of data) {
        let row = scoreboardBody.insertRow(-1);
        if (record_id === o._id) {row.style.color = 'red'}
        let cell1 = row.insertCell(0);
        let cell2 = row.insertCell(1);
        let cell3 = row.insertCell(2);
        let cell4 = row.insertCell(3);
        cell1.innerHTML = count + '.';
        cell2.innerHTML = o.name;
        cell3.innerHTML = o.score + ' %';
        cell4.innerHTML = '<img src="Flags/blank.gif" class="scoreboard-flag flag flag-' + o.flag + '"/>';
        count++;
      }
      checkScoreboardHeadingFit();
    })
    .catch((err) => console.log(err));
}

function checkForNewRecord() {
  const score = averageScore;
  const data = { score: score };
  fetch('/check-for-new-record', {
    method: 'POST',
    body: JSON.stringify(data),
    headers:{ 'Content-Type': 'application/json' }
  }).then((res) => res.text())
    .then((data) => {if (data !== 'false') {
      clearInterval(clickToStartFlashingMessage);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      containerNewRecord.innerHTML = data;

      const newRecordBody = document.getElementById('new_record_body');
      const newRecordflagPlaceholer = document.getElementById('flag_placeholder');
      const newRecordnameField = document.getElementById('new_record_form_name_field');
      const newRecordnameMaxLengthPopUp = document.getElementById('new_record_form_name_max_length_popup');
      const newRecordSubmitButton = document.getElementById('new_record_form_submit');

      newRecordBody.addEventListener('click', e => {
        if (!e.target.matches('img')) return;
        newRecordflagPlaceholer.src = 'Flags/blank.gif';
        newRecordflagPlaceholer.classList = e.target.className;
        if (newRecordnameField.value.length !== 0) {
          newRecordSubmitButton.disabled = false;
          newRecordSubmitButton.classList.remove('inactive');
        }
      });

      newRecordnameField.addEventListener('input', () => {
        if (newRecordnameField.value.trim().length > 10) {
          newRecordnameMaxLengthPopUp.style.display = 'block';
          newRecordSubmitButton.disabled = true;
          newRecordSubmitButton.classList.add('inactive');
          return;
        } else if (newRecordnameMaxLengthPopUp.style.display !== 'none') {
          newRecordnameMaxLengthPopUp.style.display = 'none';
        }
        if (newRecordflagPlaceholer.classList.length !== 0 && newRecordnameField.value.trim().length !== 0) {
          newRecordSubmitButton.disabled = false;
          newRecordSubmitButton.classList.remove('inactive');
        } else {
          newRecordSubmitButton.disabled = true;
          newRecordSubmitButton.classList.add('inactive');
        }
      });

      containerNewRecord.style.display = 'flex';
    } else {
      clickToStart();
    }
    })
    .catch((err) => console.log(err));
}

function sendNewRecord() {
  const newRecordflagPlaceholer = document.getElementById('flag_placeholder');
  const newRecordnameField = document.getElementById('new_record_form_name_field');
  const flag = newRecordflagPlaceholer.className.slice(10, 13);
  const name = newRecordnameField.value;
  const score = averageScore;
  const data = { flag: flag, name: name, score: score };

  containerNewRecord.style.display = 'none';
  let loader = pleaseWait();

  fetch('/new-record', {
    method: 'POST',
    body: JSON.stringify(data),
    headers:{ 'Content-Type': 'application/json' }
  }).then((res) => res.json())
    .then((data) => {
      containerNewRecord.innerHTML = '';
      clearInterval(loader);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      showScoreboard(data);
      setTimeout(() => {
        if (clickToStartFlashingMessage === null) {
          containerScoreboard.style.display = 'none';
          clickToStart();
        }
      }, 8000);
    })
    .catch((err) => console.log(err));
}

function pleaseWait() {
  ctx.font = canvas.width * 0.11 + 'px' + ' impact';
  ctx.fillStyle = 'yellow';
  ctx.textAlign = 'center';
  let dots = '';
  return setInterval(function () {
    dots += ' .';
    if (dots.length > 10) {dots = ''}
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillText('Please wait', canvas.width/2, canvas.height / 2);
    ctx.fillText(dots, canvas.width/2, canvas.height / 1.8);
  }, 500);
}