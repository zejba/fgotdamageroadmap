function openMenu(p) {
  document.querySelector('.menu').classList.toggle('is-active');
}

//サーヴァントリストを生成
function generateServantList() {
  let csv = new XMLHttpRequest();
  csv.open("GET", "data/servant_data.csv",false);
  csv.send(null);
  if (csv.status != 200) {
    return;
  }
  let arr = [];
  let list = csv.responseText.split('\n');
  for (let i = 0; i < list.length; i++) {
    arr.push(list[i].split(',').slice(0,2));
  }

  let menu = document.getElementById("servant-list");
  for(var i=0;i<arr.length;i++){
    let opt = document.createElement("option");
    opt.value = arr[i][0];
    opt.text = arr[i][0] + "." + arr[i][1];
    menu.appendChild(opt);
  }
}
  