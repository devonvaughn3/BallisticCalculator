function dragDecel(v, bc) {
  return (v * v) / (bc * 218000);
}

function spinDrift(yards, spinRPM) {
  return 1.2 * Math.pow(yards, 1.83) / 1000000;
}

function runCalculator() {
  const bulletWeight = parseFloat(document.getElementById("bulletWeight").value);
  const bc = parseFloat(document.getElementById("bc").value);
  const mv = parseFloat(document.getElementById("muzzleVelocity").value);
  const zeroRange = parseFloat(document.getElementById("zeroRange").value);
  const sightHeight = parseFloat(document.getElementById("sightHeight").value);
  const twist = parseFloat(document.getElementById("barrelTwist").value);
  const windSpeed = parseFloat(document.getElementById("windSpeed").value);
  const windAngle = parseFloat(document.getElementById("windAngle").value);

  const g = 32.174;
  const ydsToFt = 3.0;
  const mphToFps = 1.46667;
  const inPerFt = 12.0;

  let stepYd = 1;
  let outputStepYd = 5;
  let maxRangeYd = 1000;

  let velocity = mv;
  let dropFt = 0;
  let driftFt = 0;
  let yVel = 0;
  let xYd = 0;

  let windFps = windSpeed * mphToFps;
  let windRad = windAngle * Math.PI / 180;
  let windEff = windFps * Math.sin(windRad);

  let zeroDropFt = null;

  let spinRPM = (12 / twist) * mv * 60;

  let tbody = document.querySelector("#results tbody");
  tbody.innerHTML = "";

  while (xYd <= maxRangeYd) {
    let dt = (stepYd * ydsToFt) / velocity;
    velocity -= dragDecel(velocity, bc) * dt;
    if (velocity <= 0) break;

    yVel += -g * dt;
    dropFt += yVel * dt;
    driftFt += windEff * dt;

    if (Math.round(xYd) === zeroRange && zeroDropFt === null) {
      zeroDropFt = dropFt - (sightHeight / inPerFt);
    }

    if (Math.round(xYd * 10) % (outputStepYd * 10) === 0) {
      let dropIn;
      if (zeroDropFt !== null) {
        dropIn = (dropFt - zeroDropFt - (sightHeight / inPerFt)) * inPerFt;
      } else {
        dropIn = (dropFt - (sightHeight / inPerFt)) * inPerFt;
      }
      let mils = xYd > 0 ? dropIn / ((xYd * 36) / 1000) : 0;
      let moa = xYd > 0 ? dropIn / (xYd * 1.047) : 0;
      let windDriftIn = driftFt * inPerFt;
      let spinDriftIn = spinDrift(xYd, spinRPM);

      let row = `<tr><td>${xYd.toFixed(1)}</td><td>${dropIn.toFixed(2)}</td>
                 <td>${mils.toFixed(2)}</td><td>${moa.toFixed(2)}</td>
                 <td>${windDriftIn.toFixed(2)}</td><td>${spinDriftIn.toFixed(2)}</td></tr>`;
      tbody.innerHTML += row;
    }

    xYd += stepYd;
  }
}
