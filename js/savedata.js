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
    savedata.push(getSkillData("passive-skill"));

    //ターンごとに処理
    for (let i=1; i<=turns; i++) {
      let t = document.getElementById("turn"+i);
      savedata.push([document.getElementById("turn"+i+"-class").value,
                    document.getElementById("turn"+i+"-attr").value,
                    Number(document.getElementById("turn"+i+"-enemy-hp").value),
                    Number(document.getElementById("turn"+i+"-dtdr").value),
                    Number(document.getElementById("turn"+i+"-dsr").value)]);
      savedata.push(getSkillData("turn"+i+"-skill"));
      for (let j=1; j<=3; j++) {
        savedata.push([document.getElementById("turn"+i+"-card"+j+"-color").value,
                      document.getElementById("turn"+i+"-card"+j+"-bool").value,
                      document.getElementById("turn"+i+"-card"+j+"-ovk").value,
                      document.getElementById("turn"+i+"-card"+j+"-cri").value]);
        savedata.push(getSkillData("turn"+i+"-card"+j+"-skill"));
      }
      savedata.push([document.getElementById("turn"+i+"-card4-color").value,
                     document.getElementById("turn"+i+"-card4-bool").value,
                     document.getElementById("turn"+i+"-card4-ovk").value]);
      savedata.push(getSkillData("turn"+i+"-card4-skill"));
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
function getSkillData(p) {
  let skill = document.getElementById(p);
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

        inputSkillData("passive-skill", arr[1]);

        for (let i = 1; i <= arr[0][17]; i++) {
          addTurn();
          document.getElementById("turn"+i+"-class").value = arr[10*i-8][0];
          document.getElementById("turn"+i+"-attr").value = arr[10*i-8][1];
          document.getElementById("turn"+i+"-enemy-hp").value = Number(arr[10*i-8][2]);
          document.getElementById("turn"+i+"-dtdr").value = Number(arr[10*i-8][3]);
          document.getElementById("turn"+i+"-dsr").value = Number(arr[10*i-8][4]);
          inputSkillData("turn"+i+"-skill", arr[10*i-7]);
          for (let j=1; j<=4; j++) {
            document.getElementById("turn"+i+"-card"+j+"-color").value = arr[10*i+2*j-8][0];
            document.getElementById("turn"+i+"-card"+j+"-bool").value = Number(arr[10*i+2*j-8][1]);
            document.getElementById("turn"+i+"-card"+j+"-ovk").value = Number(arr[10*i+2*j-8][2]);
            if (j!=4) {
              document.getElementById("turn"+i+"-card"+j+"-cri").value = Number(arr[10*i+2*j-8][3]);
            }
            inputSkillData("turn"+i+"-card"+j+"-skill", arr[10*i+2*j-7]);
          }
        }
      });
    }
  }
}


//受け取った配列(arrc)を元にスキル情報を反映
function inputSkillData(p, arrc) {
  let f = document.getElementById(p)
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
  csv.open("GET", "data/servant_data.csv?date=202308151530",false);
  try {
    csv.send(null);
  } catch (err) {
    alert(err);
  }
  let arr = [];
  let list = csv.responseText.split('\n');
  for (let i = 0; i < list.length; i++) {
    arr.push(list[i].split(','));
  }
  let i = arr.findIndex(item => item[0] == document.getElementById("servant-list").value);
  if (i === -1) {return}
  document.getElementById('servant-class').value = arr[i][2];
  document.getElementById('servant-attr').value = arr[i][3];
  document.getElementById('servant-atk').value = Number(arr[i][4]);
  if (document.getElementById("perfect-check").checked) {
    document.getElementById('servant-atk').value = Number(arr[i][5]);
  }
  document.getElementById('np-color').value = arr[i][6];
  document.getElementById('np-mag').value = Number(arr[i][7]);
  document.getElementById('np-rate').value = Number(arr[i][8]);
  document.getElementById('star-rate').value = Number(arr[i][9]);
  document.getElementById('b-hit-count').value = Number(arr[i][10]);
  document.getElementById('a-hit-count').value = Number(arr[i][11]);
  document.getElementById('q-hit-count').value = Number(arr[i][12]);
  document.getElementById('n-hit-count').value = Number(arr[i][13]);
  document.getElementById('ex-hit-count').value = Number(arr[i][14]);
  let psform = document.getElementById("passive-skill");
  for (let j = 0; j < arr[i][15]; j++) {
    addForm(psform.children[0]);
  }
  let buffForms = psform.getElementsByClassName("buff-form");
  let x = buffForms.length - arr[i][15];
  for (let j = 0; j < arr[i][15]; j++) {
    buffForms[x+j].getElementsByClassName('skill-name')[0].value = "クラススキル";
    buffForms[x+j].getElementsByClassName('skill-type')[0].value = arr[i][16+j*2];
    buffForms[x+j].getElementsByClassName('amount')[0].value = Number(arr[i][17+j*2]);
    buffForms[x+j].getElementsByClassName('turn')[0].value = 0;
    buffForms[x+j].getElementsByClassName('time')[0].value = 0;
  }
}
