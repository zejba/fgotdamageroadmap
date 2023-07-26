function calculate() {
  // 基本情報を取得
  const servantClass = document.getElementById('servant-class').value;
  const servantAttr = document.getElementById('servant-attr').value;
  const servantAtk = Number(document.getElementById('servant-atk').value);
  const craftEssenceAtk = Number(document.getElementById('craft-essence-atk').value);
  const atk = servantAtk + craftEssenceAtk;
  const npColor = document.getElementById('np-color').value;
  const npMag = Number(document.getElementById('np-mag').value);
  const bFootprint =  Number(document.getElementById('b-footprint').value);
  const aFootprint =  Number(document.getElementById('a-footprint').value);
  const qFootprint =  Number(document.getElementById('q-footprint').value);
  const npbool = document.getElementById("np-calc-check").checked;
  const npRate = Number(document.getElementById('np-rate').value);
  const starRate = Number(document.getElementById('star-rate').value) / 100;
  const nHit = Number(document.getElementById('n-hit-count').value);
  const bHit = Number(document.getElementById('b-hit-count').value);
  const aHit = Number(document.getElementById('a-hit-count').value);
  const qHit = Number(document.getElementById('q-hit-count').value);
  const exHit = Number(document.getElementById('ex-hit-count').value);
  const classCorr = classCheck(servantClass);
  const turns = document.getElementsByClassName("turn-form").length;
  let totalResult = [];
  let npResult = [];
  let starResult = [];
  buffs = {};
  // バフ量、ターン、回数
  // 各バフの最初の要素は永続バフ
  buffs["atk_buff"] = [[0,Infinity,Infinity]];
  buffs["b_buff"] = [[0,Infinity,Infinity]];
  buffs["b_power_buff"] = [[0,Infinity,Infinity]];
  buffs["a_buff"] = [[0,Infinity,Infinity]];
  buffs["a_power_buff"] = [[0,Infinity,Infinity]];
  buffs["q_buff"] = [[0,Infinity,Infinity]];
  buffs["q_power_buff"] = [[0,Infinity,Infinity]];
  buffs["ex_buff"] = [[0,Infinity,Infinity]];
  buffs["ex_power_buff"] = [[0,Infinity,Infinity]];
  buffs["np_buff"] = [[0,Infinity,Infinity]];
  buffs["cr_buff"] = [[0,Infinity,Infinity]];
  buffs["b_cr_buff"] = [[0,Infinity,Infinity]];
  buffs["a_cr_buff"] = [[0,Infinity,Infinity]];
  buffs["q_cr_buff"] = [[0,Infinity,Infinity]];
  buffs["sp_buff"] = [[0,Infinity,Infinity]];
  buffs["npget_buff"] = [[0,Infinity,Infinity]];
  buffs["starget_buff"] = [[0,Infinity,Infinity]];
  buffs["npget_per_turn"] = [[0,Infinity,Infinity]];
  buffs["starget_per_turn"] = [[0,Infinity,Infinity]];
  buffs["sp_np"] = [[0,Infinity,Infinity]];
  buffs["sp_def"] = [[0,Infinity,Infinity]];
  buffs["damage_plus"] = [[0,Infinity,Infinity]];
  buffs["np_mag_up"] = [[0, Infinity, Infinity]];


  //パッシブスキル取得
  readBuff("passive-skill");

  
  //ターン数ループ
  for (let i = 1; i <= turns; i++) {
    let result = [];
    //エネミー情報を取得
    let vsclass = Number(document.getElementById("turn"+i+"-class").value);
    let vsattr = Number(document.getElementById("turn"+i+"-attr").value);
    let enemyHp = Number(document.getElementById("turn"+i+"-enemy-hp").value);
    let dtdr = Number(document.getElementById("turn"+i+"-dtdr").value) / 100;
    let dsr = Number(document.getElementById("turn"+i+"-dsr").value) / 100;

    // スキルのバフを計算
    readBuff("turn"+i+"-skill");

    // カード選択を取得
    let cardColors = [];
    cardColors.push(document.getElementById("turn"+i+"-card1-color").value);
    cardColors.push(document.getElementById("turn"+i+"-card2-color").value);
    cardColors.push(document.getElementById("turn"+i+"-card3-color").value);
    cardColors.push("ex");
    let bFirstBonus = 0;
    let aFirstBonus = 0;
    let qFirstBonus = 0;
    let busterChainBonus = 0;

    //カード補正に変換
    let cardCorres = cardColors.map(function(value) {
      if (value=="n") {
        value = npColor;
      } 
      if (value=="b") {
        return 1.5;
      } else if (value=="a") {
        return 1;
      } else if (value=="q") {
        return 0.8;
      } else {
        return 0.625;
      }
    });

    //1stボーナス
    if (cardCorres[0] == 1.5) {
      bFirstBonus = 0.5;
    } else if (cardCorres[0] == 1.0){
      aFirstBonus = 1;
    } else if (cardCorres[0] == 0.8) {
      qFirstBonus = 0.2;
    }
    if (cardCorres[0] != cardCorres[1] && cardCorres[1] != cardCorres[2] && cardCorres[0] != cardCorres[2]) {
      bFirstBonus = 0.5;
      aFirstBonus = 1;
      qFirstBonus = 0.2;
    }
    //Bチェインボーナス
    if (cardCorres.slice(0,3).every(element => element == 1.5)) {
      busterChainBonus = 1;
    }

    for (let j = 1; j <= 4; j++) {
      // カードのバフを計算
      readBuff("turn"+i+"-card"+j+"-skill");
      //判定
      let bl = Number(document.getElementById("turn"+i+"-card"+j+"-bool").value);
      //オバキル
      let ovk = Number(document.getElementById("turn"+i+"-card"+j+"-ovk").value);
      // クリティカル判定
      let cr = 1;
      if (j!=4) {
        cr = Number(document.getElementById("turn"+i+"-card"+j+"-cri").value);
      }
      // 固定ダメージを0で定義
      let constantDamage = 0;
      // EXカードが選択されていなければバフを消費せず次へ
      if (j == 4 && document.getElementById("turn"+i+"-card4-color").value == -1) {
        bl = 2;
      }

      // 他鯖のカード使用時は回数バフを消費せず次へ
      if (bl != 2) {
        //固定ダメージ
        constantDamage += buffTotalling("damage_plus");
        //カード色の取得
        let cardColor = cardColors[j-1];
        // デフォルトを通常攻撃にする
        let actType = "normal";
        let mag = 1;
        let hit;
        let cardNpCorr = 0;
        let cardStarCorr = 0;
        // atk計算
        let corrected_atk = atk;
        //足跡とhitの処理(この段階では宝具はn)
        if (cardColor == "b") {
          corrected_atk += bFootprint;
          constantDamage += (corrected_atk * 0.2 * busterChainBonus);
          hit = bHit;
          cardStarCorr = 0.05 + j * 0.05;
        } else if (cardColor == "a") {
          corrected_atk += aFootprint;
          hit = aHit;
          cardNpCorr = 1.5 + j * 1.5;
        } else if (cardColor == "q") {
          corrected_atk += qFootprint;
          hit = qHit
          cardNpCorr = 0.5 + j * 0.5;
          cardStarCorr = 0.3 + j * 0.5;
        }
        //クラス補正
        corrected_atk = corrected_atk * classCorr;
        //宝具の場合
        if (cardColor == "n") {
          cr = 1;
          hit = nHit
          actType = "np";
          //宝具倍率
          mag = (npMag + buffTotalling("np_mag_up"))/100;
          //特攻宝具処理
          let spnp = buffTotalling("sp_np");
          if (spnp != 0) {
            mag = mag * (spnp / 100);
          }
          //宝具色
          cardColor = npColor;
          //NP
          if (npColor=="b") {
            cardStarCorr = 0.1;
          } else if (npColor=="a") {
            cardNpCorr = 3;
          } else if (npColor=="q") {
            cardNpCorr = 1;
            cardStarCorr = 0.8;
          }
        //クリティカルの場合
        } else if (cr == 2) {
          actType = "cr";
          mag = 2;
        //EXの場合
        } else if (cardColor == "ex") {
          hit = exHit
          actType = "ex";
          mag = 2;
          cardNpCorr = 1;
          cardStarCorr = 1;
          //同色チェインの場合
          if (cardCorres[0] == cardCorres[1] && cardCorres[1] == cardCorres[2]) {
            mag = 3.5;
          }
        }

        //各種バフ計算
        let atkbuff = Math.max(buffTotalling("atk_buff") / 100, -1);
        let npcardbuff = buffTotalling(cardColor + "_buff") / 100;
        let cardpowerbuff = buffTotalling(cardColor + "_power_buff") / 100;
        let cardbuff = Math.max((npcardbuff + cardpowerbuff), -1);
        let starcardbuff = npcardbuff;
        npcardbuff = Math.max(npcardbuff, -1);
        let spbuff = Math.max(buffTotalling("sp_buff") / 100, -1);
        let spdef = Math.min(buffTotalling("sp_def") / 100, 1);
        let npgetbuff = Math.max(buffTotalling("npget_buff") / 100, -1);
        let stargetbuff = buffTotalling("starget_buff") / 100;
        let nporcrbuff = 0;
        let cardCorr;
        let bfb = bFirstBonus;
        let afb = aFirstBonus;
        let qfb = qFirstBonus;
        //宝具orクリバフとカード補正
        if (actType == "np") {
          nporcrbuff = Math.max(buffTotalling("np_buff") / 100, -1);
          cardCorr = cardCorres[j-1];
          bfb = 0;
          afb = 0;
          qfb = 0;
        } else {
          cardCorr = cardCorres[j-1] * (1 + (j-1) * 0.2);
          if (actType == "cr") {
            nporcrbuff = Math.max((buffTotalling("cr_buff") + buffTotalling(cardColor + "_cr_buff")) / 100, -1);
          }
        }

        //0ダメージ選択時は回数消費
        if (bl == 1) {
          result.push([0,0]);
          npResult.push(npGetCalc(npRate, cardNpCorr, npcardbuff, afb, dtdr, npgetbuff, cr, hit, ovk));
          starResult.push(starGetCalc(starRate, cardStarCorr, starcardbuff, qfb, dsr, stargetbuff, cr, hit, ovk));
        } else {
          result.push([damageCalc(corrected_atk, mag, cardCorr, cardbuff, bfb, vsclass, vsattr, atkbuff, nporcrbuff, spbuff, spdef), constantDamage])
          npResult.push(npGetCalc(npRate, cardNpCorr, npcardbuff, afb, dtdr, npgetbuff, cr, hit, ovk));
          starResult.push(starGetCalc(starRate, cardStarCorr, starcardbuff, qfb, dsr, stargetbuff, cr, hit, ovk));
        }

        //他選択時は回数消費しない
      } else {
        result.push([0, 0]);
        npResult.push(0);
        starResult.push([0,0]);
      }
    }

    //表出力用の配列を生成
    totalResult.push(cardColors[0].toUpperCase());
    totalResult.push(cardColors[1].toUpperCase());
    totalResult.push(cardColors[2].toUpperCase());

    let sum = 0;
    for (let l=0; l < 4; l++) {
      let x = Math.floor(result[l][0]*0.9 + result[l][1]);
      totalResult.push(x);
      sum += x;
    }
    totalResult.push(sum);
    totalResult.push(enemyHp);
    totalResult.push(passRate(result[0][0],result[1][0],result[2][0],result[3][0],(enemyHp - (result[0][1]+result[1][1]+result[2][1]+result[3][1]))));

    sum = 0;
    for (let l=0; l < 4; l++) {
      let x = Math.floor(result[l][0]*1.0 + result[l][1]);
      totalResult.push(x);
      sum += x;
    }
    totalResult.push(sum);
    sum = 0;

    for (let l=0; l < 4; l++) {
      let x = Math.floor(result[l][0]*1.099 + result[l][1]);
      totalResult.push(x);
      sum += x;
    }
    totalResult.push(sum);
 
    //ターン経過処理
    Object.keys(buffs).forEach((element) => {
      for (let k=0; k < buffs[element].length; k++) {
        if (buffs[element][k][1] != Infinity) {
          buffs[element][k][1] -= 1;
        } 
      }
      buffs[element] = buffs[element].filter(elem => elem[1] > 0);
    });
  }

  //出力

  //リザルトフォームを生成
  addResultForm(turns, npbool);
  let op = document.getElementsByName("result");
  let npr = document.getElementsByName("npresult");
  let starr = document.getElementsByName("starresult");

  //ターン数ループ
  for (let i=0; i<turns; i++) {
    //カード色部分
    for (let j=0; j < 3; j++) {
      let k = i*20 + j; 
      op[k].textContent = totalResult[k].toLocaleString();
      if (document.getElementById("colorcheck").children[0].checked) {
        let cardcolor = totalResult[k];
        if (totalResult[k]=="N") {
          cardcolor = npColor.toUpperCase();  
        }
        if (cardcolor=="B") {
          op[k].parentElement.style.backgroundColor = "tomato";
        } else if (cardcolor=="A") {
          op[k].parentElement.style.backgroundColor = "cornflowerblue";
        } else if (cardcolor=="Q") {
          op[k].parentElement.style.backgroundColor = "lightgreen";
        }
      } else {
        op[k].parentElement.style.backgroundColor = "white";
      }
    }
    //数値部分
    for (let j=3; j < 20; j++) {
      let k = i*20 + j; 
      op[k].textContent = totalResult[k].toLocaleString();
    }
    //NP部分
    if (npbool) {
      let npsum = 0;
      let starsum = [0,0];
      for (let j=0; j<=3; j++) {
        npr[i*5+j].textContent = npResult[i*4+j] + "%";
        npsum += 100 * npResult[i*4+j];
        starr[i*5+j].textContent = starResult[i*4+j][0] + "(+" + starResult[i*4+j][1] + ")" + Math.floor(Math.max(starResult[i*4+j][2],0) * 1000) / 10 + "～" + Math.floor(Math.max(starResult[i*4+j][3],0) * 1000) / 10 + "%";
        starsum[0] += starResult[i*4+j][0];
        starsum[1] += starResult[i*4+j][1];
      }
      npr[i*5+4].textContent = Math.floor(npsum) / 100 + "%";
      starr[i*5+4].textContent = starsum[0] + "(+" + starsum[1] + ")";
    }

  }
}


// magは宝具なら倍率(特攻込み)、通常攻撃なら1、クリティカルなら2、EXなら2or3.5
function damageCalc(atk, mag, cardCorr, cardbuff, fb, vsclass, vsattr, atkbuff, nporcrbuff, spbuff, spdef) {
  let result;
  result = atk * 0.23 * mag * (cardCorr * (1+cardbuff) + fb) * vsclass * vsattr * (1+atkbuff) * (1+nporcrbuff+spbuff) * (1-spdef);
  return result;
}

//クラス補正
function classCheck(svclass) {
  if (["berserker", "ruler", "avenger"].includes(svclass)) {
    return 1.1;
  } else if (svclass == "lancer") {
    return 1.05;
  } else if (svclass == "archer") {
    return 0.95;
  } else if (["caster", "assassin"].includes(svclass)) {
    return 0.9;
  } else {
    return 1;
  }
}

//バフ取得
function readBuff(element) {
  const ele = document.getElementById(element);
  let buffForms = [];
  if (ele.length != 0) {
    buffForms = ele.getElementsByClassName("buff-form");
  }
  for (let i = 0; i < buffForms.length; i++) {
    const skillType = buffForms[i].getElementsByClassName('skill-type')[0].value;
    const amount =  Number(buffForms[i].getElementsByClassName('amount')[0].value);
    const turn = Number(buffForms[i].getElementsByClassName('turn')[0].value);
    const time = Number(buffForms[i].getElementsByClassName('time')[0].value);
    if (amount != 0) {
      if (["npget", "starget"].includes(skillType)) {
      } else {
        // 永続スキル
        if (turn==0 && time==0) {
          buffs[skillType][0][0] += amount;
        // ターン制スキル
        } else if (time==0) {
          buffs[skillType].push([amount, turn, Infinity]);
        // 回数制スキル
        } else {
          buffs[skillType].push([amount, turn, time]);
        }
      }
    }
  }

}

//バフ処理
function buffTotalling(buffName) {
  let buff = 0;
  for (let i=0; i < buffs[buffName].length; i++) {
    buff += Number(buffs[buffName][i][0]);
    //回数制バフの回数を減らす
    if (buffs[buffName][i][2] != Infinity) {
      buffs[buffName][i][2] -= 1;
    } 
  }

  //回数が切れたバフを消す
  buffs[buffName] = buffs[buffName].filter(element => element[2] > 0);
  return buff;
}


//撃破率計算
function passRate(d1,d2,d3,d4,target) {
  let first = [];
  let second = [];
  for (let i = 0.900; i <= 1.099; i += 0.001) {
    for (let j = 0.900; j <= 1.099; j += 0.001) {
      first.push(Math.floor(d1*i+d2*j));
      second.push(Math.floor(d3*i+d4*j));
    }
  }
  second.sort((a,b) => a - b);
  let cnt = 0;
  first.forEach(function(elt) {
    cnt += (40000 - binarySearch((target - elt), second));
  });
  return (Math.floor(cnt / 160000))/100;
}

//二分探索
function binarySearch(target, arr) {
  let left = 0;
  let right = 39999;
  if (target <= arr[left]) {
    return 0;
  } else if (target > arr[right]) {
    return 40000;
  }

  while (right - left > 1) {
    let mid = Math.floor((left+right) / 2);
    if (target > arr[mid]) {
      left = mid;
    } else {
      right = mid;
    }
  }
  return left+1;
}

//表を増やす
function addResultForm(i, np) {
  const parent = document.getElementById("result-form");
  //初期化
  let t = document.getElementsByClassName("result-content");
  for (let k=0; k<t.length;) {
    t[0].remove();
  }
  //ターンの数ループ
  for (let j=1; j <=i; j++) {
  //1行ごとに処理
    let template = document.getElementById("result-template1").content;
    let newresult = template.cloneNode(true); 
    newresult.children[0].children[0].textContent = j+"T";
    parent.appendChild(newresult);
    if (np) {
      template = document.getElementById("result-template2").content;
      newresult = template.cloneNode(true);
      parent.appendChild(newresult);
    }
  }
}


//NP計算
function npGetCalc(npRate, cardNpCorr, cardbuff, fb, dtdr, npgetbuff, cr, hit, ovk) {
  if (ovk > hit) {
    ovk = hit;
  }
  let result;
  result = npRate * ((cardNpCorr * (1+cardbuff)) + fb) * dtdr * (1+npgetbuff) * cr * 100;
  //hit数をかける前に小数点第3位切り捨て
  result = Math.floor(result * 1.5) * ovk + Math.floor(result) * (hit - ovk);
  result = result / 100;
  return result
}

//スター計算
function starGetCalc(starRate, cardStarCorr, cardbuff, fb, dsr, stargetbuff, cr, hit, ovk) {
  if (cr == 2) {
    cr = 0.2;
  } else {
    cr = 0;
  }
  if (ovk > hit) {
    ovk = hit;
  }
 let sr;
 sr = starRate + ((cardStarCorr * (1+cardbuff))) + fb + dsr + stargetbuff + cr + 0.3;
 let result = [0, 0, 0, 0];
 //発生率格納
 result[2] = Math.min(sr - 0.3, 3);
 result[3] = Math.min(sr, 3);
 // if (ovk==0) {
  //オバキル0なら下限に統一
  //result[3] = result[2];
 //} else if (ovk==hit) {
  //オバキル全部なら上限に統一
  //result[2] = result[3];
 //}

 for (let i=1; i <= hit; i++) {
    if (i==ovk+1) {
      sr = result[2];
    }
    sr = Math.max(sr, 0)
    if (sr>=3) {
      result[0] += 3;
    } else {
      result[0] += Math.floor(sr);
      if (sr % 1 != 0) {
        result[1] += 1;
      }
    }
  }
  return result;
}