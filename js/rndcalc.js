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
  const ele1 = document.getElementsByName("card-select");
  const cnt = ele1.length
  const ele2 = document.getElementsByName("sr");
  const ele3 = document.getElementsByName("dsr");
  const ele4 = document.getElementsByName("hit-count");
  const ele5 = document.getElementsByName("card-buff");
  const ele6 = document.getElementsByName("star-buff");
  const ele7 = document.getElementsByName("critical");
  const ele8 = document.getElementsByName("additional-effect");
  const ele9 = document.getElementsByName("damage-judge");
  const ele10 = document.getElementsByName("select-required");
  const ex = ele1[cnt-1].checked;
  let info = [];
  let result = [];
  const numstr = ["①","②","③","④","⑤","⑥","⑦","⑧"];
  for (let i = 0; i<cnt; i++) {
    let x=1;
    let y=false;
    if (ele7[i].checked) {
      x = 2;
    }
    if (ele10[i].checked) {
      y = true;
    }
    info.push([ele1[i].value,
               Number(ele2[i].value),
               Number(ele3[i].value),
               Number(ele4[i].value),
               Number(ele5[i].value),
               Number(ele6[i].value),
               x,
               Number(ele8[i].value),
               Number(ele9[i].value),
               y]);
  }
  
  for (let i=0; i<cnt-1; i++) {
    for (let j=0; j<cnt-1; j++) {
      if (i===j) {
        continue;
      }
      for (let k=0; k<cnt-1; k++) {
        if (i===k || j===k) {
          continue;
        }
        let r = [];
        r.push(numstr[i]+numstr[j]+numstr[k]);
        let fb = 0;
        if (info[i][0].charAt(0) == "q" || (info[i][0].charAt(0) != info[j][0].charAt(0) && info[j][0].charAt(0) != info[k][0].charAt(0) && info[i][0].charAt(0) != info[k][0].charAt(0))) {
          fb = 0.2;
        }

        odr = [i,j,k,cnt-1];
        sum = 0;

        for (let l=0; l<4; l++) {
          //カード補正
          let act = 0;
          if (info[odr[l]][0].charAt(1) == "n") {
            act = 1;
          }
          let cardStarCorr = 0;
          if (l==3) {
            act = 2;
            cardStarCorr = 1;
          } else if (info[odr[l]][0].charAt(0) == "q") {
            cardStarCorr = 0.8;
            if (act == 0) {
              cardStarCorr += 0.5 * l;
            }
          } else if (info[odr[l]][0].charAt(0) == "b") {
            cardStarCorr = 0.1;
            if (act == 0) {
              cardStarCorr += 0.05 * l;
            }
          }
          let starRate = info[odr[l]][1] / 100;
          let dsr = info[odr[l]][2] / 100;
          let hit = info[odr[l]][3];
          let cardbuff = info[odr[l]][4] / 100;
          let stargetbuff = info[odr[l]][5] / 100;
          let cr = info[odr[l]][6];
          if (act != 0) {
            cr = 1;
          }
          //追加効果を初期値に
          let rndcount = info[odr[l]][7];
          let dg = info[odr[l]][8];
          let stp = starGetCalc(starRate, cardStarCorr, cardbuff, fb, dsr, stargetbuff, cr, hit, 0)[2];
          if (hit == 0 || dg == 0) {
            stp = 0;
          }
          let strnd = 3;
          if (stp <= 0 || dg == 0) {
            strnd = 0;
          } else if (stp <= 1) {
            strnd = 1;
          } else if (stp <= 2) {
            strnd = 2;
          }
          // ダメージ判定
          rndcount += dg;
          //星判定
          rndcount += strnd * hit;

          if (act == 0) {
            //クリティカル判定
            rndcount += 1;
          } else if (act == 1){
            //謎消費1
            rndcount += 1;
            if (dg != 0) {
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
        }
        r.push(sum);
        result.push(r.concat());
      }
    }
  }
  for (let i=0; i<cnt-1; i++) {
    if (info[i][9]) {
    result = result.filter(elem => elem[0].indexOf(numstr[i]) != -1);
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
}