function addRndResult(x) {
  const parent = document.getElementById("rndc-result");
  const element = document.getElementsByClassName("rndc-result-form");
  for (let i = element.length-1; i > 0; i--) {
    element[i].remove();
  }
  for (let i=2; i<=x; i++) {
    const clone = element[0].cloneNode(true);
    clone.children[0].textContent = i
    parent.appendChild(clone);
  }
}

function addRow() {
  const target = document.getElementById("rndex");
  const parent = target.parentElement;
  const element = document.getElementById("rndform-template").content.cloneNode(true);
  const cnt = document.getElementsByClassName("rndr").length - 3;
  if (cnt <= 4) {
    element.children[0].children[0].textContent = ["④","⑤","⑥","⑦","⑧"][cnt];
    parent.insertBefore(element,target);
  }
}

function rndCalc() {
  const cardColors = document.getElementsByName("card-select");
  const recordLength = cardColors.length
  const srs = document.getElementsByName("sr");
  const dsrs = document.getElementsByName("dsr");
  const hitCounts = document.getElementsByName("hit-count");
  const cardBuffs = document.getElementsByName("card-buff");
  const starBuffs = document.getElementsByName("star-buff");
  const criticals = document.getElementsByName("critical");
  const beforeAdditionals = document.getElementsByName("before-additional-effect");
  const afterAdditionals = document.getElementsByName("after-additional-effect");
  const damageJudgeCounts = document.getElementsByName("damage-judge");
  const requires = document.getElementsByName("select-required");
  const ex = cardColors[recordLength-1].checked;
  let input = [];
  let result = [];
  let checkableRnds = Array(100)
  checkableRnds.fill('')
  const cardNo = ["①","②","③","④","⑤","⑥","⑦","⑧","Ⓔ"];
  const cardNoBlack = ["➊", "➋", "➌", "➍", "➎", "➏", "➐", "➑", "🅔"]
  for (let i = 0; i<recordLength; i++) {
    input.push([
      cardColors[i].value,
      Number(srs[i].value),
      Number(dsrs[i].value),
      Number(hitCounts[i].value),
      Number(cardBuffs[i].value),
      Number(starBuffs[i].value),
      criticals[i].checked ? 2 : 1,
      Number(beforeAdditionals[i].value),
      Number(damageJudgeCounts[i].value),
      requires[i].checked,
      Number(afterAdditionals[i].value),
    ]);
  }
  
  for (let i=0; i<recordLength-1; i++) {
    for (let j=0; j<recordLength-1; j++) {
      if (i===j) {
        continue;
      }
      for (let k=0; k<recordLength-1; k++) {
        if (i===k || j===k) {
          continue;
        }
        let r = [];
        const header = cardNo[i]+cardNo[j]+cardNo[k]+(ex ? cardNo[cardNo.length - 1] : '')
        r.push(header);
        let firstBonus = 0;
        if (input[i][0].charAt(0) == "q" || (input[i][0].charAt(0) != input[j][0].charAt(0) && input[j][0].charAt(0) != input[k][0].charAt(0) && input[i][0].charAt(0) != input[k][0].charAt(0))) {
          firstBonus = 0.2;
        }

        const selection = [i,j,k,recordLength-1];
        let sum = 0;

        for (let l=0; l<4; l++) {
          //カード補正
          let act = 0;
          if (input[selection[l]][0].charAt(1) == "n") {
            act = 1;
          }
          let cardStarCorr = 0;
          if (l==3) {
            act = 2;
            cardStarCorr = 1;
          } else if (input[selection[l]][0].charAt(0) == "q") {
            cardStarCorr = 0.8;
            if (act == 0) {
              cardStarCorr += 0.5 * l;
            }
          } else if (input[selection[l]][0].charAt(0) == "b") {
            cardStarCorr = 0.1;
            if (act == 0) {
              cardStarCorr += 0.05 * l;
            }
          }
          let starRate = input[selection[l]][1] / 100;
          let dsr = input[selection[l]][2] / 100;
          let hit = input[selection[l]][3];
          let cardbuff = input[selection[l]][4] / 100;
          let stargetbuff = input[selection[l]][5] / 100;
          let cr = input[selection[l]][6];
          if (act != 0) {
            cr = 1;
          }
          //追加効果を初期値に
          let rndcount = input[selection[l]][7] + input[selection[l]][10];
          let damageCount = input[selection[l]][8];
          let stp = starGetCalc(starRate, cardStarCorr, cardbuff, firstBonus, dsr, stargetbuff, cr, hit, 0)[2];
          if (hit == 0 || damageCount == 0) {
            stp = 0;
          }
          let strnd = 3;
          if (stp <= 0 || damageCount == 0) {
            strnd = 0;
          } else if (stp <= 1) {
            strnd = 1;
          } else if (stp <= 2) {
            strnd = 2;
          }
          // ダメージ判定
          rndcount += damageCount;
          //星判定
          const starJudgeCount = strnd * hit
          rndcount += starJudgeCount;

          if (act == 0) {
            //クリティカル判定
            rndcount += 1;
          } else if (act == 1){
            //謎消費1
            rndcount += 1;
            if (damageCount != 0) {
              //補助宝具でなければダメージ成功判定(謎消費2)
              rndcount += 1;
            }
          }
          //EXのチェックがオフなら0にする
          if (l==3 && !ex) {
            stp = 0;
            rndcount = 0;
          }
          r.push(Math.trunc(stp*1000) / 10);
          r.push(rndcount);
          r.push(strnd);
          sum += rndcount;
          if (!(l === 3 && !ex)) { 
          const checkableRndEnd = sum - input[selection[l]][10] - starJudgeCount
            for (let ii=damageCount; ii > 0; ii--) {
              let turn = l === 0 ? '1st' : l === 1 ? '2nd' : l === 2 ? '3rd' : 'EX'
              const newHeader = header.replace(header.charAt(l), cardNoBlack[cardNo.indexOf(header[l])])
              checkableRnds[checkableRndEnd - ii + 1] = `${newHeader} ${turn}-${ii}`
            }
          }
        }
        r.push(sum);
        result.push(r.concat());
      }
    }
  }
  for (let i=0; i<recordLength-1; i++) {
    if (input[i][9]) {
    result = result.filter(elem => elem[0].indexOf(cardNo[i]) != -1);
    }
  }
  if (document.getElementById("sort-check").checked) {
    result.sort((a,b) => a[13] - b[13]);
  }
  let strchk = false;
  if (document.getElementById("star-check").checked) {
    strchk = true;
  }
  addRndResult(result.length)
  let target = document.getElementsByName("rndcresult");
  for (let i=0; i<result.length; i++) {
    let res1 = result[i][2];
    let res2 = result[i][5];
    let res3 = result[i][8];
    let res4 = result[i][11];
    if (strchk) {
      res1 += "(" + result[i][3] + ")";
      res2 += "(" + result[i][6] + ")";
      res3 += "(" + result[i][9] + ")";
      res4 += "(" + result[i][12] + ")";
    }
    target[i*10].textContent = result[i][0];
    target[i*10+1].textContent = res1;
    target[i*10+2].textContent = res2;
    target[i*10+3].textContent = res3;
    target[i*10+4].textContent = res4;
    target[i*10+5].textContent = result[i][1] +"%";
    target[i*10+6].textContent = result[i][4] +"%";
    target[i*10+7].textContent = result[i][7] +"%";
    target[i*10+8].textContent = result[i][10] +"%";
    target[i*10+9].textContent = result[i][13];
  }
  const parent = document.getElementById("checkable-rnds")
  parent.innerHTML = ''
  for (let i=0; i < 100; i++) {
    if (!checkableRnds[i]) {
      continue
    }
    let li = document.createElement('li')
    li.innerHTML = `${i}: ${checkableRnds[i]}`
    parent.appendChild(li)
  }
}