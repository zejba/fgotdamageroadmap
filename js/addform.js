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
  const n = document.getElementsByClassName("turn-wrapper").length - 1;
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
}

function deleteTurn() {
  let result = window.confirm("ターンを削除しますか？");
  const n = document.getElementsByClassName("turn-wrapper").length - 2;
  if (n>0 && result) {
    document.getElementById("turn"+n).remove();
  }
}