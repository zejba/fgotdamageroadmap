function addForm(p) {
  const template = document.getElementById("buff-form-template");
  const newform = template.content.cloneNode(true);
  const parent = p.parentElement;
  parent.appendChild(newform);
}

function deleteForm(p) {
  p.parentElement.remove();
};

function addTurn() {
  const template = document.getElementById("turn-template");
  const newturn = template.content.cloneNode(true);
  const n = document.getElementsByClassName("turn-form").length + 1;
  newturn.querySelector("h3").textContent = n+"T目";
  newturn.getElementById("turnx").id = "turn"+n;
  let eclass = newturn.querySelector(".enemy-class");
  let attr = newturn.querySelector(".enemy-attr");
  let enemyHp = newturn.querySelector(".enemy-hp");
  let dtdr = newturn.querySelector(".dtdr");
  let dsr = newturn.querySelector(".dsr");
  //エネミー情報引継ぎ
  if (n>=2) {
    let preturn = document.getElementById("turn"+(n-1));
    eclass.value = preturn.getElementsByClassName("enemy-class")[0].value;
    attr.value = preturn.getElementsByClassName("enemy-attr")[0].value;
    enemyHp.value = preturn.getElementsByClassName("enemy-hp")[0].value;
    dtdr.value = preturn.getElementsByClassName("dtdr")[0].value;
    dsr.value = preturn.getElementsByClassName("dsr")[0].value;
  }
  //カード情報追加
  const parent = document.getElementById("turns");
  parent.appendChild(newturn);
  colorChangeCheck();
  npCalcCheck(document.getElementById("np-calc-check"));
}

function deleteTurn(b,p) {
  let target = p.parentElement.parentElement;
  let turn = Number(target.id.replace(/\D/g,""));
  let len = document.getElementsByClassName("turn-form").length;
  let result
  if (b===0) {
    result = window.confirm("ターン"+turn+"を削除しますか？");
  } else {
    result = true
  }
  if (result) {
    target.remove();
    //以後ターンのidとタイトルを変更
    for (let i=turn+1; i<=len; i++) {
      let tf = document.getElementById("turn"+i);
      tf.id = "turn" + (i-1);
      tf.querySelector("h3").textContent = (i-1)+"T目";
    }
  }  
}

// 宝具関連のバフが選択された場合自動的に量とターンの初期値を調整
function inputChange(p) {
  if (p.value=="sp_np") {
    p.parentElement.getElementsByClassName("amount")[0].value = "100";
    p.parentElement.getElementsByClassName("turn")[0].options[10].selected = true;
    p.parentElement.getElementsByClassName("time")[0].options[0].selected = true;
  } else if (p.value=="np_mag_up") {
    p.parentElement.getElementsByClassName("turn")[0].options[10].selected = true;
    p.parentElement.getElementsByClassName("time")[0].options[0].selected = true;
  }
}

//バフ並べ替え
function sortForm(p) {
  let f = p.parentElement;
  let bfr = f.previousElementSibling;
  if (bfr.className.split(" ")[0]=="buff-form") {
  f.parentElement.insertBefore(f, bfr);
  }
}

//カード色に応じて入力フォームの色を変更
function changeColor(p) {
  let cardcolor = p.value;
  const cfield = p.parentElement.parentElement.parentElement
  if (document.getElementById("colorcheck").children[0].checked) {
    if (cardcolor=="n") {
      cardcolor = document.getElementById("np-color").value;    
    }
    if (cardcolor=="b") {
      cfield.style.backgroundColor = "tomato";
    } else if (cardcolor=="a") {
      cfield.style.backgroundColor = "cornflowerblue";
    } else if (cardcolor=="q") {
      cfield.style.backgroundColor = "lightgreen";
    }
  } else {
    cfield.style.backgroundColor = "white";
  }
}

//宝具色とチェックボックス変更時に色変更を実行
function colorChangeCheck() {
  let p = document.getElementsByClassName("card-color-select");
  for (let i = 0; i < p.length; i++) {
    changeColor(p[i]);
  }
}

//ターンとバフを削除(インポート時に実行)
function resetForm() {
  let tf = document.getElementsByClassName("turn-form");
  for (let i = tf.length-1; i >= 0; i--) {
    tf[i].remove();
  }
  let bf = document.getElementsByClassName("buff-form");
  for (let i = bf.length-1; i >= 0; i--) {
    bf[i].remove();
  }
}

function npCalcCheck(p) {
  let target = document.getElementsByClassName("np-and-star-info")
  if (p.checked) {
    for (let i=0; i <target.length; i++) {
      target[i].style.display = "inline-block";
    }
  } else {
    for (let i=0; i <target.length; i++) {
      target[i].style.display = "none";
    }
  }
}

//クラススコア自動入力
function addScoreForm(p) {
  const scoreType = ["b_power_buff","b_cr_buff","a_power_buff","a_cr_buff","q_power_buff","q_cr_buff","ex_buff","cr_buff","np_buff","starget_buff"];
  const scoreAmount = [20,20,20,40,20,60,50,10,10,50];
  for (let i = 0; i < 10; i++) {
    addForm(p);
  }
  let buffForms = p.parentElement.getElementsByClassName("buff-form");
  let x = buffForms.length - 10;
  for (let i = 0; i < 10; i++) {
    buffForms[x+i].getElementsByClassName('skill-name')[0].value = "スコア";
    buffForms[x+i].getElementsByClassName('skill-type')[0].value = scoreType[i];
    buffForms[x+i].getElementsByClassName('amount')[0].value = scoreAmount[i];
    buffForms[x+i].getElementsByClassName('turn')[0].value = 0;
    buffForms[x+i].getElementsByClassName('time')[0].value = 0;
  }
}

//AS自動入力
function addAS1Form(p) {
  addForm(p);
  let buffForms = p.parentElement.getElementsByClassName("buff-form");
  let x = buffForms.length - 1;
  buffForms[x].getElementsByClassName('skill-name')[0].value = "AS1";
  buffForms[x].getElementsByClassName('skill-type')[0].value = "ex_buff";
  buffForms[x].getElementsByClassName('amount')[0].value = 50;
  buffForms[x].getElementsByClassName('turn')[0].value = 0;
  buffForms[x].getElementsByClassName('time')[0].value = 0;
}

//AS自動入力
function addAS3Form(p) {
  addForm(p);
  let buffForms = p.parentElement.getElementsByClassName("buff-form");
  let x = buffForms.length - 1;
  buffForms[x].getElementsByClassName('skill-name')[0].value = "AS3";
  buffForms[x].getElementsByClassName('skill-type')[0].value = "atk_buff";
  buffForms[x].getElementsByClassName('amount')[0].value = 30;
  buffForms[x].getElementsByClassName('turn')[0].value = 0;
  buffForms[x].getElementsByClassName('time')[0].value = 0;
}

//AS自動入力
function addAS4Form(p) {
  addForm(p);
  let buffForms = p.parentElement.getElementsByClassName("buff-form");
  let x = buffForms.length - 1;
  buffForms[x].getElementsByClassName('skill-name')[0].value = "AS4";
  buffForms[x].getElementsByClassName('skill-type')[0].value = "cr_buff";
  buffForms[x].getElementsByClassName('amount')[0].value = 30;
  buffForms[x].getElementsByClassName('turn')[0].value = 0;
  buffForms[x].getElementsByClassName('time')[0].value = 0;
}

//礼装ATK自動入力
function setAtk(value) {
  let target = document.getElementById("craft-essence-atk");
  target.value = value;
}

//完全体チェック時
function perfectCheck(p) {
  document.getElementById("lv120-check").checked = p.checked;
  document.getElementById("goldfou-check").checked = p.checked;
  document.getElementById("footprint-check").checked = p.checked;
}