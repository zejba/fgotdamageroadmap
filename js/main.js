function openMenu(p) {
  document.querySelector('.menu').classList.toggle('is-active');
}

//サーヴァントリストを生成
function generateServantList(b) {
  let csv = new XMLHttpRequest();
  csv.open("GET", "data/servant_data.csv?date=202403281130",false);
  csv.send(null);
  if (csv.status != 200) {
    return;
  }
  let arr = [];
  let list = csv.responseText.split('\n');
  list.shift();
  for (let i = 0; i < list.length; i++) {
    arr.push(list[i].split(','));
  }

  let menu = document.getElementById("servant-list");
  let svcl = document.getElementById("servant-list-class").value;
  let svr = document.getElementById("servant-list-rarity").value;

  menu.innerHTML = "";

  for(var i=0;i<arr.length;i++){
    if (b==1) {
      if (svcl != arr[i][3] || svr != arr[i][2]) {
        continue;
      }
    }
    let opt = document.createElement("option");
    opt.value = arr[i][0];
    opt.text = arr[i][0] + "." + arr[i][1];
    menu.appendChild(opt);
  }
}

//クエストリストを生成
function generateQuesttList() {
  let csv = new XMLHttpRequest();
  csv.open("GET", "data/quest_data.csv?date=202403281130",false);
  csv.send(null);
  if (csv.status != 200) {
    return;
  }
  let arr = [];
  let list = csv.responseText.split('\n');
  for (let i = 0; i < list.length; i++) {
    arr.push(list[i].split(','));
  }

  let menu = document.getElementById("quest-list");
  menu.innerHTML = "";

  for(var i=0;i<arr.length;i++){
    let opt = document.createElement("option");
    opt.value = arr[i][0];
    opt.text = arr[i][1];
    menu.appendChild(opt);
  }
}
  