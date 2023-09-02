//エクスポート
function exportData() {
  if (window.confirm("CSVファイルを保存しますか?")) {
  //形式[[基本情報、ターン数],[スキル数、パッシブスキル],[クラス相性,属性相性,HP],[スキル数,スキル*n],[カード,クリ判定],[スキル数,スキル*m],...]
    let savedata = [];
    //基本情報
    let info = [];
    info.push(document.getElementById('servant-name').value.replace(/,/g,"，"));
    info.push(document.getElementById('servant-class').value);
    info.push(document.getElementById('servant-attr').value);
    info.push(Number(document.getElementById('servant-atk').value));
    info.push(Number(document.getElementById('craft-essence-atk').value));
    info.push(document.getElementById('np-color').value);
    info.push(Number(document.getElementById('np-mag').value));
    info.push(Number(document.getElementById('b-footprint').value));
    info.push(Number(document.getElementById('a-footprint').value));
    info.push(Number(document.getElementById('q-footprint').value));
    info.push(Number(document.getElementById('np-rate').value));
    info.push(Number(document.getElementById('star-rate').value));
    info.push(Number(document.getElementById('n-hit-count').value));
    info.push(Number(document.getElementById('b-hit-count').value));
    info.push(Number(document.getElementById('a-hit-count').value));
    info.push(Number(document.getElementById('q-hit-count').value));
    info.push(Number(document.getElementById('ex-hit-count').value));

    const turns = document.getElementsByClassName("turn-form").length;
    info.push(turns);
    savedata.push(info);

    //パッシブスキル
    savedata.push(getSkillData(0,0));

    //ターンごとに処理
    for (let i=1; i<=turns; i++) {
      let tf = document.getElementById("turn"+i);
      savedata.push([tf.getElementsByClassName("enemy-class")[0].value,
                    tf.getElementsByClassName("enemy-attr")[0].value,
                    Number(tf.getElementsByClassName("enemy-hp")[0].value),
                    Number(tf.getElementsByClassName("dtdr")[0].value),
                    Number(tf.getElementsByClassName("dsr")[0].value)]);
      savedata.push(getSkillData(i,0));
      for (let j=1; j<=3; j++) {
        savedata.push([tf.getElementsByClassName("card"+j+"-color")[0].value,
                      tf.getElementsByClassName("card"+j+"-bool")[0].value,
                      tf.getElementsByClassName("card"+j+"-ovk")[0].value,
                      tf.getElementsByClassName("card"+j+"-cri")[0].value]);
        savedata.push(getSkillData(i,j));
      }
      savedata.push([tf.getElementsByClassName("card4-color")[0].value,
                     tf.getElementsByClassName("card4-bool")[0].value,
                     tf.getElementsByClassName("card4-ovk")[0].value]);
      savedata.push(getSkillData(i,4));
    }

    //CSV形式に変換して保存
    var blob = new Blob([arrToStr(savedata)],{type:"text/csv"});
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download ="fgodamageroadmap"+getYMD()+".csv";
    link.click();
  }
}

//スキルの入力情報を取得
function getSkillData(turn,card) {
  let skill = document.getElementById("turn"+turn).getElementsByClassName("card"+card+"-skill")[0];
  let buffForms = [];
  let skilldata = [];
  buffForms = skill.getElementsByClassName("buff-form");
  skilldata.push(buffForms.length);
  for (let i = 0; i < buffForms.length; i++) {
    skilldata.push(buffForms[i].getElementsByClassName('skill-name')[0].value.replace(/,/g,"，"),
                   buffForms[i].getElementsByClassName('skill-type')[0].value,
                   Number(buffForms[i].getElementsByClassName('amount')[0].value),
                   Number(buffForms[i].getElementsByClassName('turn')[0].value),
                   Number(buffForms[i].getElementsByClassName('time')[0].value));
  }
  return skilldata;
}

//yyyymmddhhmm
function getYMD() {
  let date = new Date();
  return date.getFullYear()+("0"+(date.getMonth()+1)).slice(-2)+("0"+date.getDate()).slice(-2)+("0"+date.getHours()).slice(-2)+("0"+date.getMinutes()).slice(-2);
}

//配列をCSV用の文字列に変換
function arrToStr(arr) {
  let ans = "";
  arr.forEach((element,index) => {
    if (index != 0) {
      ans += "\n";
    }
    element.forEach((ele2, index2) => {
      if (index2 != 0) {
        ans += ",";
      }
      ans += ele2;
    });
  });
  return ans
}

//インポート
function inportData() {
  //アップロード
  const input = document.getElementById("upload-file");
  const file = input.files[0];

  //ファイルの有無と形式を確認
  if (typeof file !== "undefined") {
    if (file.type==="text/csv") {
      //読み込んで配列に変換
      var reader = new FileReader();
      reader.readAsText(file);
      reader.addEventListener("load", function() {
        let data = reader.result;
        let arr = [];
        let list = data.split('\n');
        for (let i = 0; i < list.length; i++) {
          arr.push(list[i].split(','));
        }
        resetForm();

        //基本情報を反映
        document.getElementById('servant-name').value = arr[0][0];
        document.getElementById('servant-class').value = arr[0][1];
        document.getElementById('servant-attr').value = arr[0][2];
        document.getElementById('servant-atk').value = Number(arr[0][3]);
        document.getElementById('craft-essence-atk').value = Number(arr[0][4]);
        document.getElementById('np-color').value = arr[0][5];
        document.getElementById('np-mag').value = Number(arr[0][6]);
        document.getElementById('b-footprint').value = Number(arr[0][7]);
        document.getElementById('a-footprint').value = Number(arr[0][8]);
        document.getElementById('q-footprint').value = Number(arr[0][9]);
        document.getElementById('np-rate').value = Number(arr[0][10]);
        document.getElementById('star-rate').value = Number(arr[0][11]);
        document.getElementById('n-hit-count').value = Number(arr[0][12]);
        document.getElementById('b-hit-count').value = Number(arr[0][13]);
        document.getElementById('a-hit-count').value = Number(arr[0][14]);
        document.getElementById('q-hit-count').value = Number(arr[0][15]);
        document.getElementById('ex-hit-count').value = Number(arr[0][16]);

        inputSkillData(0,0,arr[1]);

        for (let i = 1; i <= arr[0][17]; i++) {
          addTurn();
          let tf = document.getElementById("turn"+i);
          tf.getElementsByClassName("enemy-class")[0].value = arr[10*i-8][0];
          tf.getElementsByClassName("enemy-attr")[0].value = arr[10*i-8][1];
          tf.getElementsByClassName("enemy-hp")[0].value = Number(arr[10*i-8][2]);
          tf.getElementsByClassName("dtdr")[0].value = Number(arr[10*i-8][3]);
          tf.getElementsByClassName("dsr")[0].value = Number(arr[10*i-8][4]);
          inputSkillData(i,0,arr[10*i-7]);
          for (let j=1; j<=4; j++) {
            tf.getElementsByClassName("card"+j+"-color")[0].value = arr[10*i+2*j-8][0];
            tf.getElementsByClassName("card"+j+"-bool")[0].value = Number(arr[10*i+2*j-8][1]);
            tf.getElementsByClassName("card"+j+"-ovk")[0].value = Number(arr[10*i+2*j-8][2]);
            if (j!=4) {
              tf.getElementsByClassName("card"+j+"-cri")[0].value = Number(arr[10*i+2*j-8][3]);
            }
            inputSkillData(i,j,arr[10*i+2*j-7]);
          }
        }
      });
    }
  }
}


//受け取った配列(arrc)を元にスキル情報を反映
function inputSkillData(turn,card,arrc) {
  let f = document.getElementById("turn"+turn).getElementsByClassName("card"+card+"-skill")[0];
  for (let i = 0; i < arrc[0]; i++) {
    addForm(f.children[0], 0);
    let buffForms = f.getElementsByClassName("buff-form");
    buffForms[i].getElementsByClassName('skill-name')[0].value = arrc[i*5+1];
    buffForms[i].getElementsByClassName('skill-type')[0].value = arrc[i*5+2];
    buffForms[i].getElementsByClassName('amount')[0].value = Number(arrc[i*5+3]);
    buffForms[i].getElementsByClassName('turn')[0].value = Number(arrc[i*5+4]);
    buffForms[i].getElementsByClassName('time')[0].value = Number(arrc[i*5+5]);
  }
}

//データベース
function reflectsvData() {
  let csv = new XMLHttpRequest();
  csv.open("GET", "data/servant_data.csv?date=202309011230",false);
  csv.send(null);
  if (csv.status != 200) {
    return;
  }
  let arr = [];
  let list = csv.responseText.split('\n');
  for (let i = 0; i < list.length; i++) {
    arr.push(list[i].split(','));
  }
  let i = arr.findIndex(item => item[0] == document.getElementById("servant-list").value);
  if (i === -1) {return}
  document.getElementById('servant-class').value = arr[i][3];
  document.getElementById('servant-attr').value = arr[i][4];
  document.getElementById('servant-atk').value = Number(arr[i][5]);
  if (document.getElementById("perfect-check").checked) {
    document.getElementById('servant-atk').value = Number(arr[i][6]);
  }
  document.getElementById('np-color').value = arr[i][7];
  document.getElementById('np-mag').value = Number(arr[i][8]);
  document.getElementById('np-rate').value = Number(arr[i][9]);
  document.getElementById('star-rate').value = Number(arr[i][10]);
  document.getElementById('b-hit-count').value = Number(arr[i][11]);
  document.getElementById('a-hit-count').value = Number(arr[i][12]);
  document.getElementById('q-hit-count').value = Number(arr[i][13]);
  document.getElementById('ex-hit-count').value = Number(arr[i][14]);
  document.getElementById('n-hit-count').value = Number(arr[i][15]);
  let psform = document.getElementById("passive-skill");
  let buffForms = psform.getElementsByClassName("buff-form");
  for (let j = buffForms.length - 1; j >= 0; j--) {
    if (buffForms[j].getElementsByClassName('skill-name')[0].value == "クラススキル") {
      buffForms[j].remove();
    }
  }
  for (let j = 0; j < arr[i][16]; j++) {
    addForm(psform.children[0]);
  }
  buffForms = psform.getElementsByClassName("buff-form");
  let x = buffForms.length - arr[i][16];
  for (let j = 0; j < arr[i][16]; j++) {
    buffForms[x+j].getElementsByClassName('skill-name')[0].value = "クラススキル";
    buffForms[x+j].getElementsByClassName('skill-type')[0].value = arr[i][17+j*2];
    buffForms[x+j].getElementsByClassName('amount')[0].value = Number(arr[i][18+j*2]);
    buffForms[x+j].getElementsByClassName('turn')[0].value = 0;
    buffForms[x+j].getElementsByClassName('time')[0].value = 0;
  }
}

function reflectQData() {
  let csv = new XMLHttpRequest();
  csv.open("GET", "data/quest_data.csv?date=202309011230",false);
  csv.send(null);
  if (csv.status != 200) {
    return;
  }
  let arr = [];
  let list = csv.responseText.split('\n');
  for (let i = 0; i < list.length; i++) {
    arr.push(list[i].split(','));
  }
  let q_id = arr.findIndex(item => item[0] == document.getElementById("quest-list").value);
  let q_class = document.getElementById("quest-list-class").value;
  let q_attr = document.getElementById("quest-list-attr").value;
  if (q_id === -1) {return}

  //ターンフォームを初期化
  let tf = document.getElementsByClassName("turn-form");
  for (let i = tf.length-1; i >= 0; i--) {
    tf[i].remove();
  }
  for (let i = 0; i<arr[q_id][2]; i++) {
    addTurn();
    tf = document.getElementById("turn"+(i+1));
    tf.getElementsByClassName("enemy-hp")[0].value = arr[q_id][3+i];
    tf.getElementsByClassName("enemy-class")[0].value = q_class;
    tf.getElementsByClassName("enemy-attr")[0].value = q_attr;
  }
}