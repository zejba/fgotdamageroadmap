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
  newturn.getElementById("turn0").id = "turn"+n;
  newturn.getElementById("turn0-class").id = "turn"+n+"-class";
  newturn.getElementById("turn0-attr").id = "turn"+n+"-attr";
  newturn.getElementById("turn0-enemy-hp").id = "turn"+n+"-enemy-hp";
  let skill = newturn.getElementById("turn0-skill");
  skill.id = "turn"+n+"-skill";
  skill.children[0].setAttribute("onclick", "addForm(this, "+(n*5-4)+")");
  for (let i=1; i <=4; i++) {
    newturn.getElementById("turn0-card"+i).id = "turn"+n+"-card"+i;
    newturn.getElementById("turn0-card"+i+"-color").id = "turn"+n+"-card"+i+"-color";
    newturn.getElementById("turn0-card"+i+"-cri").id = "turn"+n+"-card"+i+"-cri";
    let skill = newturn.getElementById("turn0-card"+i+"-skill");
    skill.id = "turn"+n+"-card"+i+"-skill";
    skill.children[0].setAttribute("onclick", "addForm(this, "+(5*n+i-4)+")");
  }
  const parent = document.getElementById("turns");
  parent.appendChild(newturn);
  colorChangeCheck();
}

function deleteTurn() {
  let result = window.confirm("ターンを削除しますか？");
  const n = document.getElementsByClassName("turn-wrapper").length - 2;
  if (n>0 && result) {
    document.getElementById("turn"+n).remove();
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
  if (bfr.className=="buff-form") {
  f.parentElement.insertBefore(f, bfr);
  }
}

//カード色に応じて入力フォームの色を変更
function changeColor(p) {
  let cardcolor = p.value;
  const cfield = p.parentElement.parentElement
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