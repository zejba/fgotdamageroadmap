function calculate() {
  // 固定値を取得
  const servantClass = document.getElementsByName('servant-class').item(0).value;
  const servantAttr = document.getElementsByName('servant-attr').item(0).value;
  const servantAtk = Number(document.getElementsByName('servant-atk').item(0).value);
  const craftEssenceAtk = Number(document.getElementsByName('craft-essence-atk').item(0).value);
  const atk = servantAtk + craftEssenceAtk;
  const npColor = document.getElementsByName('np-color').item(0).value;
  const npMag = Number(document.getElementsByName('np-mag').item(0).value);
  const bFootprint =  Number(document.getElementsByName('b-footprint').item(0).value);
  const aFootprint =  Number(document.getElementsByName('a-footprint').item(0).value);
  const qFootprint =  Number(document.getElementsByName('q-footprint').item(0).value);
  const classCorr = classCheck(servantClass);
  const turns = document.getElementsByClassName("turn-wrapper").length - 2;
  let totalResult = [];
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

  readBuff("passive-skill");

  for (let i = 1; i <= turns; i++) {
    let result = [];
    //エネミー情報を取得
    let vsclass = Number(document.getElementById("turn"+i+"-class").value);
    let vsattr = Number(document.getElementById("turn"+i+"-attr").value);
    let enemyHp = Number(document.getElementById("turn"+i+"-enemy-hp").value);

    // スキルのバフを計算
    readBuff("turn"+i+"-skill");

    // カード選択を取得
    let cardColors = [];
    cardColors.push(document.getElementById("turn"+i+"-card1-color").value);
    cardColors.push(document.getElementById("turn"+i+"-card2-color").value);
    cardColors.push(document.getElementById("turn"+i+"-card3-color").value);
    cardColors.push("ex");
    let firstBonus = 0;
    let busterChainBonus = 0;

    //カード補正を取得
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
    if (cardCorres[0] == 1.5 || (cardCorres[0] != cardCorres[1] && cardCorres[1] != cardCorres[2] && cardCorres[0] != cardCorres[2])) {
      firstBonus = 0.5;
    }
    if (cardCorres.slice(0,3).every(element => element == 1.5)) {
      busterChainBonus = 1;
    }

    for (let j = 1; j <= 4; j++) {
      // カードのバフを計算
      readBuff("turn"+i+"-card"+j+"-skill");
      // クリティカル判定
      let cr = Number(document.getElementById("turn"+i+"-card"+j+"-cri").value);
      // 固定ダメージを0で定義
      let constantDamage = 0;

      // EXカードが選択されていなければバフを消費せず次へ
      if (j == 4 && document.getElementById("turn"+i+"-card4-color").value == -1) {
        cr = -1;
      }

      // 他鯖のカード使用時は回数バフを消費せず次へ
      if (cr != -1) {
        //固定ダメージ
        constantDamage += buffTotalling("damage_plus");
        //カード色の取得
        let cardColor = cardColors[j-1];
        // デフォルトを通常攻撃にする
        let actType = "normal";
        let mag = 1;
        // atk計算
        let corrected_atk = atk;
        //足跡の処理(この段階では宝具はn)
        if (cardColor == "b") {
          corrected_atk += bFootprint;
          constantDamage += (corrected_atk * 0.2 * busterChainBonus);
        } else if (cardColor == "a") {
          corrected_atk += aFootprint;
        } else if (cardColor == "q") {
          corrected_atk += qFootprint;
        }
        //クラス補正
        corrected_atk = corrected_atk * classCorr;
        //宝具の場合
        if (cardColor == "n") {
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
        //クリティカルの場合
        } else if (cr == 2) {
          actType = "cr";
          mag = 2;
        //EXの場合
        } else if (cardColor == "ex") {
          actType = "ex";
          mag = 2;
          //同色チェインの場合
          if (cardCorres[0] == cardCorres[1] && cardCorres[1] == cardCorres[2]) {
            mag = 3.5;
          }
        }
        let atkbuff = Math.max(buffTotalling("atk_buff") / 100, -1);
        let cardbuff = Math.max((buffTotalling(cardColor + "_buff") + buffTotalling(cardColor + "_power_buff")) / 100, -1);
        let spbuff = Math.max(buffTotalling("sp_buff") / 100, -1);
        let spdef = Math.min(buffTotalling("sp_def") / 100, 1);
        let nporcrbuff = 0;
        let card;
        //宝具orクリバフとカード補正
        if (actType == "np") {
          nporcrbuff = Math.max(buffTotalling("np_buff") / 100, -1);
          card = cardCorres[j-1] * (cardbuff+1);
        } else {
          card = cardCorres[j-1] * (1 + (j-1) * 0.2) * (cardbuff+1) + firstBonus;
          if (actType == "cr") {
            nporcrbuff = Math.max((buffTotalling("cr_buff") + buffTotalling(cardColor + "_cr_buff")) / 100, -1);
          }
        }
        if (cr == 0) {
          result.push([0,0]);
        } else {
          result.push([damageCalc(corrected_atk, mag, card, vsclass, vsattr, atkbuff, nporcrbuff, spbuff, spdef), constantDamage])
        }

      } else {
        result.push([0, 0]);
      }
    }

    //トータルリザルトを生成
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
  addResultForm(turns);
  let op = document.getElementsByName("result");

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
  }
}


// magは宝具なら倍率(特攻込み)、通常攻撃なら1、クリティカルなら2、EXなら2or3.5
function damageCalc(atk, mag, card, vsclass, vsattr, atkbuff, nporcrbuff, spbuff, spdef) {
  let result;
  result = atk * 0.23 * mag * card * vsclass * vsattr * (1+atkbuff) * (1+nporcrbuff+spbuff) * (1-spdef);
  return result;
}

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

function readBuff(element) {
  const ele = document.getElementById(element);
  let buffForms = [];
  if (ele.length != 0) {
    buffForms = ele.getElementsByClassName("buff-form");
  }
  for (let i = 0; i < buffForms.length; i++) {
    const skillType = buffForms[i].getElementsByClassName('skill-type')[0].value;
    const ammount =  Number(buffForms[i].getElementsByClassName('ammount')[0].value);
    const turn = Number(buffForms[i].getElementsByClassName('turn')[0].value);
    const time = Number(buffForms[i].getElementsByClassName('time')[0].value);
    if (ammount != 0) {
      if (["npget", "starget"].includes(skillType)) {
      } else {
        // 永続スキル
        if (turn==0 && time==0) {
          buffs[skillType][0][0] += ammount;
        // ターン制スキル
        } else if (time==0) {
          buffs[skillType].push([ammount, turn, Infinity]);
        // 回数制スキル
        } else {
          buffs[skillType].push([ammount, turn, time]);
        }
      }
    }
  }

}

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


//表を増やす
function addResultForm(i) {
  const parent = document.getElementById("result-form");
  //2行目以降を削除
  const cnt = document.getElementsByClassName("r1").length;
  for (let m=1; m < cnt; m++) {
    document.getElementsByClassName("r1")[1].remove();
    document.getElementsByClassName("r2")[1].remove();
    document.getElementsByClassName("r3")[1].remove();
    document.getElementsByClassName("r4")[1].remove();
  }
  //ターンの数ループ
  for (let j=2; j <=i; j++) {
    //1行ごとに処理
    for (let k=1; k<=4; k++) {
      let template = document.getElementsByClassName("r"+k)[0];
      let newresult = template.cloneNode(true); 
      if (k==1) {
        newresult.children[0].textContent = j+"T";
      }
      parent.appendChild(newresult);
    }
  }
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
